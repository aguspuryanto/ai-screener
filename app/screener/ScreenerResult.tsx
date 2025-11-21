import CategoryCard from "@/app/components/CategoryCard";
import ScoreLabel from "@/app/components/ScoreLabel";


type ScreenerOutput = {
  quality: boolean;
  value: boolean;
  growth: boolean;
  momentum: boolean;
  risk: boolean;
  liquidity: boolean;
  totalPass: number;
  label: "STRONG BUY" | "BUY" | "WATCHLIST" | "HOLD" | "AVOID";
} | null;

export default function ScreenerResult({ data }: { data: ScreenerOutput }) {
  if (!data) return null;

  const categories = [
    { title: "Quality", key: "quality" },
    { title: "Value", key: "value" },
    { title: "Growth", key: "growth" },
    { title: "Momentum", key: "momentum" },
    { title: "Risk", key: "risk" },
    { title: "Liquidity", key: "liquidity" },
  ];

  return (
    <div className="mt-6 space-y-4">
      <ScoreLabel label={data.label} />

      {categories.map((cat) => (
        <CategoryCard
          key={cat.key}
          title={cat.title}
          status={data[cat.key as keyof typeof data] as boolean}
        />
      ))}
    </div>
  );
}
