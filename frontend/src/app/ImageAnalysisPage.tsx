'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

type AnalysisResult = {
    id: number;
    success: boolean;
    message: string;
    estimated_data?: {
        class: number;
        class_name?: string;
        confidence: number;
    };
};

export default function ImageAnalysisPage() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [error, setError] = useState<string>('');
    const [isDragOver, setIsDragOver] = useState(false);

    const handleFileSelect = (file: File) => {
        setSelectedFile(file);
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        setResult(null);
        setError('');
    };

    const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const handleDragOver = (event: React.DragEvent) => {
        event.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (event: React.DragEvent) => {
        event.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (event: React.DragEvent) => {
        event.preventDefault();
        setIsDragOver(false);
        const files = event.dataTransfer.files;
        if (files && files[0]) {
            handleFileSelect(files[0]);
        }
    };

    const analyzeImage = async () => {
        if (!selectedFile) return;

        setIsAnalyzing(true);
        setError('');
        setResult(null);

        try {
            const formData = new FormData();
            formData.append('image', selectedFile);

            const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
            const response = await fetch(`${apiBaseUrl}/api/analyze/`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            setResult(data);
        } catch (error) {
            console.error('Analysis error:', error);
            setError('解析中にエラーが発生しました。しばらく待ってから再度お試しください。');
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* ヘッダー */}
                <div className="text-center mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                        AI画像解析
                    </h1>
                    <p className="text-sm sm:text-base text-gray-600 mb-4">
                        AIによる画像の物体検出を体験しよう
                    </p>
                    <div className="flex justify-center">
                        <Link
                            href="/analysis-logs"
                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                        >
                            📋 解析ログ一覧を見る
                        </Link>
                    </div>
                </div>

                {/* ファイル選択 */}
                {!previewUrl && (
                    <div
                        className={`bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-4 sm:mb-6 border-2 border-dashed transition-colors ${isDragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
                            }`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        <label className="block cursor-pointer">
                            <span className="block text-sm font-medium text-gray-700 mb-2">
                                画像ファイルを選択 または ドラッグ&ドロップ
                            </span>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileInputChange}
                                className="block w-full text-sm text-gray-500 
                                         file:mr-4 file:py-2 file:px-4 
                                         file:rounded-full file:border-0 
                                         file:text-sm file:font-semibold 
                                         file:bg-blue-50 file:text-blue-700 
                                         hover:file:bg-blue-100"
                            />
                            <p className="mt-2 text-xs text-gray-500">
                                対応形式: JPG, PNG, GIF, WEBP
                            </p>
                        </label>
                    </div>
                )}

                {/* 画像プレビュー */}
                {previewUrl && (
                    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-medium text-gray-700">プレビュー</h3>
                            <button
                                onClick={() => {
                                    setSelectedFile(null);
                                    setPreviewUrl('');
                                    setResult(null);
                                    setError('');
                                }}
                                className="text-red-600 hover:text-red-800 text-sm px-2 py-1 rounded hover:bg-red-50 transition-colors"
                            >
                                削除
                            </button>
                        </div>
                        <div
                            className={`relative w-full h-48 sm:h-64 bg-gray-100 rounded-lg overflow-hidden cursor-pointer transition-all ${isDragOver ? 'ring-2 ring-blue-400 bg-blue-50' : ''
                                }`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => document.getElementById('file-input-preview')?.click()}
                            title="クリックまたはドラッグで画像を変更"
                        >
                            <Image
                                src={previewUrl}
                                alt="アップロード画像"
                                fill
                                className="object-contain"
                            />
                        </div>
                        <input
                            id="file-input-preview"
                            type="file"
                            accept="image/*"
                            onChange={handleFileInputChange}
                            className="hidden"
                        />
                        <div className="flex items-center justify-between mt-2">
                            <p className="text-xs sm:text-sm text-gray-500">{selectedFile?.name}</p>
                            <p className="text-xs text-gray-400">クリックまたはドラッグで変更可能</p>
                        </div>
                    </div>
                )}

                {/* 解析ボタン */}
                <div className="mb-4 sm:mb-6">
                    <button
                        onClick={analyzeImage}
                        disabled={!selectedFile || isAnalyzing}
                        className={`w-full py-3 px-4 rounded-lg font-medium text-sm sm:text-base transition-colors ${selectedFile && !isAnalyzing
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                    >
                        {isAnalyzing ? (
                            <span className="flex items-center justify-center">
                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                                解析中...
                            </span>
                        ) : (
                            '解析開始'
                        )}
                    </button>
                </div>

                {/* 解析結果 */}
                <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">解析結果</h3>

                    {isAnalyzing ? (
                        <div className="text-center py-6">
                            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                            <p className="text-sm text-gray-600">解析中...</p>
                        </div>
                    ) : result ? (
                        <div>
                            {result.success ? (
                                <div className="space-y-3">
                                    <div className="flex items-center text-green-600 mb-3">
                                        <span className="text-lg mr-2">✅</span>
                                        <span className="text-sm font-medium">解析成功</span>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs sm:text-sm text-gray-600">検出オブジェクト:</span>
                                            <span className="font-medium text-blue-600 text-sm sm:text-base">
                                                {result.estimated_data?.class_name || `クラス ${result.estimated_data?.class}`}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs sm:text-sm text-gray-600">信頼度:</span>
                                            <span className="font-medium text-green-600 text-sm sm:text-base">
                                                {Math.round((result.estimated_data?.confidence || 0) * 100)}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                            <div
                                                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${Math.round((result.estimated_data?.confidence || 0) * 100)}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-4">
                                    <div className="flex items-center justify-center text-red-600 mb-2">
                                        <span className="text-lg mr-2">❌</span>
                                        <span className="text-sm font-medium">解析失敗</span>
                                    </div>
                                    <p className="text-xs sm:text-sm text-red-600">{result.message}</p>
                                </div>
                            )}
                        </div>
                    ) : error ? (
                        <div className="text-center py-4">
                            <div className="flex items-center justify-center text-red-600 mb-2">
                                <span className="text-lg mr-2">⚠️</span>
                                <span className="text-sm font-medium">エラー</span>
                            </div>
                            <p className="text-xs sm:text-sm text-red-600">{error}</p>
                        </div>
                    ) : (
                        <div className="text-center py-6">
                            <div className="text-3xl mb-2">🤖</div>
                            <p className="text-xs sm:text-sm text-gray-500">画像を選択して解析を開始してください</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
