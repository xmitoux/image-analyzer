type StatusBadgeProps = {
    success: boolean;
    size?: 'sm' | 'md';
    className?: string;
};

export function StatusBadge({ success, size = 'sm', className = '' }: StatusBadgeProps) {
    const baseClasses = "inline-flex items-center rounded-full font-medium";

    const sizeClasses = {
        sm: "px-2 py-1 text-xs",
        md: "px-3 py-1.5 text-sm"
    };

    const statusClasses = success
        ? "bg-green-100 text-green-800"
        : "bg-red-100 text-red-800";

    const classes = `${baseClasses} ${sizeClasses[size]} ${statusClasses} ${className}`;

    return (
        <span className={classes}>
            {success ? '✅ 成功' : '❌ 失敗'}
        </span>
    );
}
