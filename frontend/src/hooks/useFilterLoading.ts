'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

/**
 * フィルタリング時のローディング状態を管理するフック
 */
export function useFilterLoading() {
    const [isLoading, setIsLoading] = useState(false);
    const searchParams = useSearchParams();
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // URL パラメータが変更されたときにローディング状態をリセット
        setIsLoading(false);
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
    }, [searchParams]);

    const startLoading = () => {
        setIsLoading(true);

        // 安全策：5秒後に強制的にローディングを停止
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
            setIsLoading(false);
        }, 5000);
    };

    const stopLoading = () => {
        setIsLoading(false);
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
    };

    // クリーンアップ
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return {
        isLoading,
        startLoading,
        stopLoading
    };
}
