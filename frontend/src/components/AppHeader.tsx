import Link from 'next/link';

type AppHeaderProps = {
    title: string;
    subtitle: string;
    actionButton?: {
        text: string;
        href: string;
        icon?: string;
    };
    className?: string;
};

export function AppHeader({ title, subtitle, actionButton, className = '' }: AppHeaderProps) {
    return (
        <div className={`text-center mb-6 sm:mb-8 ${className}`}>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                {title}
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mb-4">
                {subtitle}
            </p>
            {actionButton && (
                <div className="flex justify-center">
                    <Link
                        href={actionButton.href}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                        {actionButton.icon && <span className="mr-1">{actionButton.icon}</span>}
                        {actionButton.text}
                    </Link>
                </div>
            )}
        </div>
    );
}
