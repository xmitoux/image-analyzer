export function formatAbsoluteTime(dateString: string): string {
    const date = new Date(dateString);

    // ハイドレーションエラーを避けるため、統一されたフォーマットを使用
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
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
