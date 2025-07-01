export type AnalysisLog = {
    id: number;
    image_path: string;
    success: boolean;
    classification: number | null;
    classification_name?: string | null;
    confidence: string;
    processing_time_ms: number;
    created_at: string;
}

export type ApiResponse = {
    success: boolean;
    data: {
        logs: AnalysisLog[];
        pagination: {
            current_page: number;
            total_pages: number;
            total_count: number;
            page_size: number;
            has_next: boolean;
            has_previous: boolean;
        };
    };
    message?: string;
}
