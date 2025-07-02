import Image from 'next/image';

type ImagePreviewProps = {
    imagePath?: string;
    alt: string;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
};

export function ImagePreview({ imagePath, alt, size = 'md', className = '' }: ImagePreviewProps) {
    const sizeClasses = {
        sm: "w-24 h-16",
        md: "w-full h-32",
        lg: "w-full h-48"
    };

    const containerClasses = `${sizeClasses[size]} bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden ${className}`;

    return (
        <div className={containerClasses}>
            {imagePath && imagePath.startsWith('https://') ? (
                <Image
                    src={imagePath}
                    alt={alt}
                    width={320}
                    height={0}
                    className="w-full object-contain rounded-lg"
                    style={{ width: 'auto', height: '128px' }}
                    priority
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling?.classList.remove('hidden');
                    }}
                />
            ) : null}
            <div className={`text-center ${imagePath && imagePath.startsWith('https://') ? 'hidden' : ''}`}>
                <div className="text-4xl">🖼️</div>
                <div className="text-xs text-gray-500 mt-1">画像</div>
            </div>
        </div>
    );
}
