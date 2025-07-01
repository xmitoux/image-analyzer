export function formatAbsoluteTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

export function getClassificationName(classification: number | null): string {
    if (!classification) return "未分類";
    return `ラベル ID: ${classification}`;
}

export function getClassificationColor(classification: number | null): string {
    if (!classification) return "bg-gray-100 text-gray-800";

    // IDに基づいてカラフルな色を生成（ハッシュベース）
    const colors = [
        "bg-red-100 text-red-800",
        "bg-orange-100 text-orange-800",
        "bg-amber-100 text-amber-800",
        "bg-yellow-100 text-yellow-800",
        "bg-lime-100 text-lime-800",
        "bg-green-100 text-green-800",
        "bg-emerald-100 text-emerald-800",
        "bg-teal-100 text-teal-800",
        "bg-cyan-100 text-cyan-800",
        "bg-sky-100 text-sky-800",
        "bg-blue-100 text-blue-800",
        "bg-indigo-100 text-indigo-800",
        "bg-violet-100 text-violet-800",
        "bg-purple-100 text-purple-800",
        "bg-fuchsia-100 text-fuchsia-800",
        "bg-pink-100 text-pink-800",
        "bg-rose-100 text-rose-800"
    ];

    return colors[classification % colors.length];
}
