'use client';

import { AnalysisResultCard } from '@/components/AnalysisResultCard';
import { AnalyzeButton } from '@/components/AnalyzeButton';
import { AppHeader } from '@/components/AppHeader';
import { FileUpload } from '@/components/FileUpload';
import { ImagePreviewCard } from '@/components/ImagePreviewCard';
import { useEffect, useState } from 'react';

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
    const [analyzedImageUrl, setAnalyzedImageUrl] = useState<string>(''); // 解析済み画像URL
    const [error, setError] = useState<string>('');
    const [isDragOver, setIsDragOver] = useState(false);

    // メモリリークを防ぐためのクリーンアップ
    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
            if (analyzedImageUrl) {
                URL.revokeObjectURL(analyzedImageUrl);
            }
        };
    }, [previewUrl, analyzedImageUrl]);

    const handleFileSelect = async (file: File) => {
        console.log('📁 原始ファイル:', file.name, file.type, file.size, 'bytes');

        try {
            // 画像をCanvas経由でJPEGに変換
            const convertedFile = await convertToJpeg(file);
            console.log('🔄 変換後ファイル:', convertedFile.name, convertedFile.type, convertedFile.size, 'bytes');

            setSelectedFile(convertedFile);
            const url = URL.createObjectURL(convertedFile);
            setPreviewUrl(url);
            setResult(null);
            setAnalyzedImageUrl(''); // 前の解析済み画像をクリア
            setError('');
        } catch (error) {
            console.error('❌ 画像変換エラー:', error);
            setError('画像の処理中にエラーが発生しました。別の画像をお試しください。');
        }
    };

    // 画像をJPEG形式に変換するヘルパー関数
    const convertToJpeg = (file: File): Promise<File> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = document.createElement('img');
                img.onload = () => {
                    // Canvasで画像を描画
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    if (!ctx) {
                        reject(new Error('Canvas context not available'));
                        return;
                    }

                    // 画像サイズを取得（大きすぎる場合はリサイズ）
                    let { width, height } = img;
                    const maxSize = 2048; // 最大2048px

                    if (width > maxSize || height > maxSize) {
                        const ratio = Math.min(maxSize / width, maxSize / height);
                        width *= ratio;
                        height *= ratio;
                    }

                    canvas.width = width;
                    canvas.height = height;

                    // 画像を描画
                    ctx.drawImage(img, 0, 0, width, height);

                    // JPEGとしてBlob化
                    canvas.toBlob((blob) => {
                        if (!blob) {
                            reject(new Error('Failed to convert image'));
                            return;
                        }

                        // 新しいFileオブジェクトを作成
                        const convertedFile = new File(
                            [blob],
                            file.name.replace(/\.[^/.]+$/, '.jpg'), // 拡張子をjpgに変更
                            {
                                type: 'image/jpeg',
                                lastModified: Date.now()
                            }
                        );

                        resolve(convertedFile);
                    }, 'image/jpeg', 0.9); // JPEG品質90%
                };

                img.onerror = () => reject(new Error('Failed to load image'));
                img.src = e.target?.result as string;
            };

            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(file);
        });
    };

    const handleDragOver = (event: React.DragEvent) => {
        event.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (event: React.DragEvent) => {
        event.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = async (event: React.DragEvent) => {
        event.preventDefault();
        setIsDragOver(false);
        const files = event.dataTransfer.files;
        if (files && files[0]) {
            await handleFileSelect(files[0]);
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

            console.log('🔄 画像解析開始:', selectedFile.name, selectedFile.size, 'bytes');

            // Next.js API Routes経由でバックエンドにアクセス
            const response = await fetch('/api/analyze', {
                method: 'POST',
                body: formData,
            });

            console.log('📡 フロントエンドレスポンス:', response.status, response.statusText);

            if (!response.ok) {
                // エラーレスポンスの詳細を取得
                try {
                    const errorData = await response.json();
                    console.error('❌ フロントエンドエラー詳細:', errorData);

                    const errorMessage = errorData.message || `HTTP ${response.status}: ${response.statusText}`;
                    setError(`解析エラー: ${errorMessage}`);

                    // 詳細なエラー情報があれば追加表示
                    if (errorData.error) {
                        console.error('❌ 詳細エラー:', errorData.error);
                    }
                    return;
                } catch (parseError) {
                    console.error('❌ エラーレスポンス解析失敗:', parseError);
                    const errorText = await response.text();
                    console.error('❌ エラーレスポンス生テキスト:', errorText);
                    setError(`解析エラー: HTTP ${response.status} - ${errorText || response.statusText}`);
                    return;
                }
            }

            const data = await response.json();
            console.log('✅ 解析成功:', data);
            setResult(data);

            // 解析成功時は画像URLを保存してinputをクリア
            if (data.success) {
                setAnalyzedImageUrl(previewUrl);
                setSelectedFile(null);
                setPreviewUrl('');
            }
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
                <AppHeader
                    title="🖼️ AI画像解析"
                    subtitle="AIによる画像の物体検出を体験しよう"
                    actionButton={{
                        text: "解析ログ一覧を見る",
                        href: "/analysis-logs",
                        icon: "📜"
                    }}
                />

                {/* ファイル選択 */}
                {!previewUrl && (
                    <FileUpload
                        onFileSelect={handleFileSelect}
                        isDragOver={isDragOver}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    />
                )}

                {/* 画像プレビュー */}
                {previewUrl && (
                    <ImagePreviewCard
                        previewUrl={previewUrl}
                        fileName={selectedFile?.name}
                        onDelete={() => {
                            setSelectedFile(null);
                            setPreviewUrl('');
                            setResult(null);
                            setAnalyzedImageUrl(''); // 解析済み画像もクリア
                            setError('');
                        }}
                        onFileSelect={handleFileSelect}
                        isDragOver={isDragOver}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    />
                )}

                {/* 解析ボタン */}
                <AnalyzeButton
                    onClick={analyzeImage}
                    disabled={!selectedFile || isAnalyzing}
                    isAnalyzing={isAnalyzing}
                />

                {/* 解析結果 */}
                <AnalysisResultCard
                    isAnalyzing={isAnalyzing}
                    result={result}
                    error={error}
                    analyzedImageUrl={analyzedImageUrl}
                />
            </div>
        </div>
    );
}
