import React from "react";

type StockRow = {
  Id?: number;
  Code: string;
  Name: string;
  Last: number;
  Per?: number | null;
  Pbr?: number | null;
  Roe?: number | null;
  ai: { score: number; label: string };
};

export default function Table({ stocks }: { stocks: StockRow[] }) {
  return (
    <table className="w-full table-auto border-collapse">
      <thead>
        <tr className="border-b bg-gray-100">
          <th className="px-3 py-2 text-left">Code</th>
          <th className="px-3 py-2 text-left">Name</th>
          <th className="px-3 py-2 text-left">Price</th>
          <th className="px-3 py-2 text-left">PER</th>
          <th className="px-3 py-2 text-left">PBR</th>
          <th className="px-3 py-2 text-left">ROE</th>
          <th className="px-3 py-2 text-left">AI Score</th>
          <th className="px-3 py-2 text-left">AI Signal</th>
        </tr>
      </thead>
      <tbody>
        {stocks.map((s) => (
          <tr key={s.Id ?? s.Code} className="border-b">
            <td className="px-3 py-2 font-medium">{s.Code}</td>
            <td className="px-3 py-2">{s.Name}</td>
            <td className="px-3 py-2">{s.Last}</td>
            <td className="px-3 py-2">{s.Per ?? "-"}</td>
            <td className="px-3 py-2">{s.Pbr ?? "-"}</td>
            <td className="px-3 py-2">{s.Roe ? (s.Roe * 100).toFixed(2) + "%" : "-"}</td>
            <td className="px-3 py-2 font-bold">{s.ai.score}</td>
            <td
              className={`px-3 py-2 font-bold ${
                s.ai.label === "BUY"
                  ? "text-green-600"
                  : s.ai.label === "CUT LOSS"
                  ? "text-red-600"
                  : "text-gray-600"
              }`}
            >
              {s.ai.label}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}