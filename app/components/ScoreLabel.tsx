type Label = "STRONG BUY" | "BUY" | "WATCHLIST" | "HOLD" | "AVOID";

export default function ScoreLabel({ label }: { label: Label }) {
  const colors: Record<Label, string> = {
    "STRONG BUY": "bg-green-600",
    "BUY": "bg-green-500",
    "WATCHLIST": "bg-yellow-500",
    "HOLD": "bg-blue-500",
    "AVOID": "bg-red-600",
  };

  return (
    <div className={`text-white px-4 py-2 rounded-lg text-lg font-bold text-center ${colors[label]}`}>
      {label}
    </div>
  );
}
