type FileUploadProps = {
    onFileSelect: (file: File) => void;
    isDragOver: boolean;
    onDragOver: (event: React.DragEvent) => void;
    onDragLeave: (event: React.DragEvent) => void;
    onDrop: (event: React.DragEvent) => void;
    className?: string;
};

export function FileUpload({
    onFileSelect,
    isDragOver,
    onDragOver,
    onDragLeave,
    onDrop,
    className = ''
}: FileUploadProps) {
    const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onFileSelect(file);
        }
    };

    return (
        <div
            className={`bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-4 sm:mb-6 border-2 border-dashed transition-colors ${isDragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
                } ${className}`}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
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
    );
}
