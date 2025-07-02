'use client';

import { formatAbsoluteTime } from '@/lib/utils';
import { useEffect, useState } from 'react';

type ClientTimeProps = {
    dateString: string;
    className?: string;
};

export function ClientTime({ dateString, className }: ClientTimeProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        // サーバー側では何も表示しない
        return <span className={className}>---</span>;
    }

    return (
        <span className={className}>
            {formatAbsoluteTime(dateString)}
        </span>
    );
}
