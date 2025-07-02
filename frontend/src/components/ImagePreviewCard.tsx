import Image from 'next/image';

type ImagePreviewCardProps = {
    previewUrl: string;
    fileName?: string;
    onDelete: () => void;
    onFileSelect: (file: File) => void;
    isDragOver: boolean;
    onDragOver: (event: React.DragEvent) => void;
    onDragLeave: (event: React.DragEvent) => void;
    onDrop: (event: React.DragEvent) => void;
    className?: string;
};

export function ImagePreviewCard({
    previewUrl,
    fileName,
    onDelete,
    onFileSelect,
    isDragOver,
    onDragOver,
    onDragLeave,
    onDrop,
    className = ''
}: ImagePreviewCardProps) {
    const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onFileSelect(file);
        }
    };

    return (
        <div className={`bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-4 sm:mb-6 ${className}`}>
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-700">プレビュー</h3>
                <button
                    onClick={onDelete}
                    className="text-red-600 hover:text-red-800 text-sm px-2 py-1 rounded hover:bg-red-50 transition-colors"
                >
                    削除
                </button>
            </div>
            <div
                className={`relative w-full h-48 sm:h-64 bg-gray-100 rounded-lg overflow-hidden cursor-pointer transition-all ${isDragOver ? 'ring-2 ring-blue-400 bg-blue-50' : ''
                    }`}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
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
                <p className="text-xs sm:text-sm text-gray-500">{fileName}</p>
                <p className="text-xs text-gray-400">クリックまたはドラッグで変更可能</p>
            </div>
        </div>
    );
}
