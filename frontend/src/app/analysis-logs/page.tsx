import { getAnalysisLogs } from '@/lib/api';
import AnalysisLogsPage from './AnalysisLogsPage';

// メインページ（サーバーコンポーネント）
export default async function Page() {
    const data = await getAnalysisLogs(1, 20);

    return <AnalysisLogsPage data={data} />;
}
