import { getClassificationColor } from '@/lib/utils';

type ClassificationTagProps = {
    classificationId: number;
    classificationName: string;
    onClick?: (id: number) => void;
    variant?: 'default' | 'filter';
    size?: 'sm' | 'md';
    className?: string;
};

export function ClassificationTag({
    classificationId,
    classificationName,
    onClick,
    variant = 'default',
    size = 'sm',
    className = ''
}: ClassificationTagProps) {
    const baseClasses = "inline-flex items-center rounded-full font-medium border transition-all duration-200";

    const sizeClasses = {
        sm: "px-2 py-1 text-xs",
        md: "px-3 py-1.5 text-sm"
    };

    const variantClasses = {
        default: onClick ? "hover:shadow-md hover:scale-105 cursor-pointer" : "",
        filter: "hover:shadow-md cursor-pointer"
    };

    const colorClasses = getClassificationColor(classificationId);

    const classes = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${colorClasses} ${className}`;

    const handleClick = () => {
        if (onClick) {
            onClick(classificationId);
        }
    };

    return (
        <button
            onClick={handleClick}
            className={classes}
            title={onClick ? `分類「${classificationName}」でフィルターする` : undefined}
            disabled={!onClick}
        >
            {classificationName}
        </button>
    );
}
