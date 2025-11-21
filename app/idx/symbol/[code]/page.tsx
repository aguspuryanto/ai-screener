import { notFound } from "next/navigation";
import fs from "node:fs/promises";
import path from "node:path";

const CACHE_FILE = path.join(process.cwd(), "public", "stocks.json");
const REMOTE_URL =
  "https://pasardana.id/api/StockSearchResult/GetAll?pageBegin=0&pageLength=1000&sortField=Code&sortOrder=ASC";

async function loadStocks() {
  try {
    const cached = JSON.parse(await fs.readFile(CACHE_FILE, "utf-8"));
    if (cached?.data) return cached.data;
  } catch {}

  const res = await fetch(REMOTE_URL, {
    headers: {
      Accept: "application/json",
      "User-Agent": "IDX Screener",
    },
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch stocks");
  }

  const data = await res.json();
  const list = Array.isArray(data) ? data : data?.data ?? [];
  await fs.mkdir(path.dirname(CACHE_FILE), { recursive: true });
  await fs.writeFile(
    CACHE_FILE,
    JSON.stringify({ savedAt: new Date().toISOString(), data: list }),
    "utf-8"
  );
  return list;
}

async function fetchStock(symbol: string) {
  // const stocks = await loadStocks();  
  const res = await fetch("/api/stocks");
  const stocks = await res.json();
  const stock = stocks.find(
    (item: any) => item.Code?.toUpperCase() === symbol.toUpperCase()
  );
  return stock || null;
}

export default async function SymbolPage({
  params,
}: {
  params: { code: string };
}) {
  const code = params.code;
  const stock = await fetchStock(code);

  if (!stock) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200">
        <div className="p-6 border-b border-slate-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-xs uppercase text-slate-400 tracking-wider mb-1">
                IDX SYMBOL
              </p>
              <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                {stock.Code}
                <span className="text-base font-medium text-slate-500">
                  {stock.Name}
                </span>
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Last Update: {stock.LastDate ?? "N/A"}
              </p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-slate-900">
                {stock.Last?.toLocaleString("id-ID")}
              </div>
              <div
                className={`text-lg font-semibold flex items-center justify-end gap-1 ${
                  stock.OneDay >= 0 ? "text-emerald-600" : "text-red-600"
                }`}
              >
                {(stock.OneDay * 100).toFixed(2)}%
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
              Fundamental Metrics
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "PER", value: stock.Per },
                { label: "PBR", value: stock.Pbr },
                { label: "PSR", value: stock.PsrAnnualized },
                {
                  label: "ROE",
                  value: stock.Roe ? stock.Roe * 100 : null,
                  unit: "%",
                },
              ].map((metric) => (
                <div
                  key={metric.label}
                  className="border border-slate-200 rounded-lg p-3 bg-slate-50"
                >
                  <p className="text-xs text-slate-400 uppercase tracking-wider">
                    {metric.label}
                  </p>
                  <p className="text-lg font-bold text-slate-800">
                    {metric.value !== null && metric.value !== undefined
                      ? `${Number(metric.value).toFixed(2)}${
                          metric.unit ? metric.unit : ""
                        }`
                      : "-"}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
              Market Activity
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Volume", value: stock.Volume },
                { label: "Value", value: stock.Value },
                { label: "Frequency", value: stock.Frequency },
                { label: "Market Cap", value: stock.Capitalization },
              ].map((metric) => (
                <div
                  key={metric.label}
                  className="border border-slate-200 rounded-lg p-3 bg-slate-50"
                >
                  <p className="text-xs text-slate-400 uppercase tracking-wider">
                    {metric.label}
                  </p>
                  <p className="text-sm font-semibold text-slate-800">
                    {metric.value !== null && metric.value !== undefined
                      ? metric.label === "Value" || metric.label === "Market Cap"
                        ? `Rp ${metric.value.toLocaleString("id-ID")}`
                        : metric.value.toLocaleString("id-ID")
                      : "-"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

