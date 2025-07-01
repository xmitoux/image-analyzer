import { getAnalysisLogs } from '@/lib/api';
import AnalysisLogsPage from './AnalysisLogsPage';

type PageProps = {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

// メインページ（サーバーコンポーネント）
export default async function Page({ searchParams }: PageProps) {
    const { page: paramPage, classification: paramClassification } = await searchParams;
    const page = Number(paramPage) || 1;
    const classification = paramClassification ? Number(paramClassification) : undefined;
    const pageSize = 20;

    const data = await getAnalysisLogs(page, pageSize, classification);

    return <AnalysisLogsPage data={data} />;
}
