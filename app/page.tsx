"use client";

import React, { useState, useEffect } from 'react';
import { Search, TrendingUp, BarChart3, AlertCircle, Filter, ArrowUp, ArrowDown } from 'lucide-react';
import { scoreStock } from '@/app/lib/ai';
import { StockData } from '@/modules/screener/types';
// import Table from '@/app/components/Table';

// --- Mock Data Loader (In real app, fetch from API or JSON file) ---
// Because we can't run python in browser, I will seed some mock data based on the Python logic output structure
// const MOCK_DATA: StockData[] = [
//   {
//     code: "AADI", name: "Adaro Andalan Indonesia", price: 8000, change_1d: -0.08,
//     scores: { trend: 20, momentum: 20, volume: 10, breakout: 10, risk: 5, total: 65, status: "WATCHLIST" },
//     indicators: { rsi: 58.5, macd: 120.5, ma20: 7800, atr_pct: 3.2, volume_ratio: 1.8 }
//   },
//   {
//     code: "BBCA", name: "Bank Central Asia Tbk", price: 10200, change_1d: 0.012,
//     scores: { trend: 25, momentum: 25, volume: 20, breakout: 20, risk: 10, total: 100, status: "STRONG BUY" },
//     indicators: { rsi: 66.2, macd: 50.2, ma20: 9800, atr_pct: 1.5, volume_ratio: 2.5 }
//   },
//   {
//     code: "TLKM", name: "Telkom Indonesia", price: 3200, change_1d: -0.005,
//     scores: { trend: 5, momentum: 0, volume: 0, breakout: 0, risk: 10, total: 15, status: "AVOID" },
//     indicators: { rsi: 35.0, macd: -20.5, ma20: 3400, atr_pct: 2.1, volume_ratio: 0.8 }
//   },
//   {
//     code: "GOTO", name: "GoTo Gojek Tokopedia", price: 68, change_1d: 0.04,
//     scores: { trend: 15, momentum: 25, volume: 20, breakout: 10, risk: 0, total: 70, status: "WATCHLIST" },
//     indicators: { rsi: 68.5, macd: 2.1, ma20: 60, atr_pct: 6.5, volume_ratio: 3.1 }
//   },
//   {
//     code: "BMRI", name: "Bank Mandiri", price: 7200, change_1d: 0.02,
//     scores: { trend: 25, momentum: 15, volume: 10, breakout: 20, risk: 10, total: 80, status: "STRONG BUY" },
//     indicators: { rsi: 62.0, macd: 45.0, ma20: 6900, atr_pct: 1.8, volume_ratio: 1.6 }
//   }
// ];

export default function StockScreenerDashboard() {
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [filter, setFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   // Simulasi fetch data dari output Python
  //   setTimeout(() => {
  //     setStocks(MOCK_DATA);
  //     setLoading(false);
  //   }, 800);
  // }, []);

  const fetchStocks = async () => {
    try {
      const res = await fetch("/api/stocks");
      const json = await res.json();
      if (json.success) {
        const enriched = json.data.map((s: any) => ({
          ...s,
          ai: scoreStock(s),
        }));
        setStocks(enriched);
      }
    } catch (err) {
      console.error("Error:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStocks();
  }, []);

  const filteredStocks = stocks.filter(stock => {
    const matchSearch = stock.Code.toLowerCase().includes(search.toLowerCase()) || 
                        stock.Name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "ALL" ? true : stock.ai.label === filter;
    return matchSearch && matchFilter;
  });

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-emerald-500 text-white";
    if (score >= 60) return "bg-blue-500 text-white";
    if (score >= 40) return "bg-yellow-500 text-white";
    return "bg-red-500 text-white";
  };

  const getStatusBadge = (label: string) => {
    const styles = {
      "BUY": "bg-emerald-100 text-emerald-700 border-emerald-200",
      "HOLD": "bg-blue-100 text-blue-700 border-blue-200",
      "CUT LOSS": "bg-red-100 text-red-700 border-red-200",
    };
    return styles[label as keyof typeof styles] || "bg-gray-100";
  };

  if (loading)
    return <div className="p-6 text-lg font-medium">Loading data...</div>;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 p-4 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
              <BarChart3 className="w-8 h-8 text-emerald-600" />
              IDX AI Screener
            </h1>
            <p className="text-slate-500 mt-1">Algorithmic Stock Picking System</p>
          </div>
          
          <div className="flex gap-2">
            <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-200 text-center min-w-[100px]">
              <div className="text-xs text-slate-500 font-semibold uppercase">IHSG Trend</div>
              <div className="text-emerald-600 font-bold flex justify-center items-center gap-1">
                <TrendingUp className="w-4 h-4" /> Bullish
              </div>
            </div>
            <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-200 text-center min-w-[100px]">
              <div className="text-xs text-slate-500 font-semibold uppercase">Top Picks</div>
              <div className="text-slate-800 font-bold">
                {stocks.filter(s => s.ai.label === "BUY").length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="max-w-7xl mx-auto mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search code (e.g., BBCA, ANTM)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
          {["ALL", "BUY", "HOLD", "CUT LOSS"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                filter === f 
                ? "bg-slate-800 text-white shadow-md" 
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {/* <Table stocks={filteredStocks} /> */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="text-center py-20 text-slate-400">Loading AI Analysis...</div>
        ) : filteredStocks.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300 text-slate-400">
            No stocks found matching criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStocks.map((stock) => (
              <div key={stock.Code} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden group">
                
                {/* Card Header */}
                <div className="p-5 border-b border-slate-100 flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl font-bold text-slate-800">{stock.Code}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded border ${getStatusBadge(stock.ai.label)}`}>
                        {stock.ai.label}
                      </span>
                    </div>
                    <h3 className="text-sm text-slate-500 truncate max-w-[200px]" title={stock.Name}>{stock.Name}</h3>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-slate-800">
                      {stock.Last.toLocaleString('id-ID')}
                    </div>
                    <div className={`text-sm font-medium flex items-center justify-end gap-1 ${stock.OneDay >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {stock.OneDay >= 0 ? <ArrowUp className="w-3 h-3"/> : <ArrowDown className="w-3 h-3"/>}
                      {(stock.OneDay * 100).toFixed(2)}%
                    </div>
                  </div>
                </div>

                {/* AI Score Section */}
                <div className="p-5 bg-slate-50/50">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm font-semibold text-slate-600">AI Probability Score</span>
                    <span className={`text-lg font-bold px-3 py-1 rounded-full ${getScoreColor(stock.ai.score)}`}>
                      {stock.ai.score}/100
                    </span>
                  </div>

                  {/* Progress Bars for Factors */}
                  <div className="space-y-3">
                    <ScoreBar label="Overall AI Score" value={stock.ai.score} max={100} color="bg-emerald-500" />
                  </div>
                </div>

                {/* Technical Details */}
                <div className="p-4 bg-white border-t border-slate-100 grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded bg-slate-50">
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider">PER</div>
                    <div className="font-bold text-sm text-slate-700">{stock.Per ?? '-'}</div>
                  </div>
                  <div className="p-2 rounded bg-slate-50">
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider">PBR</div>
                    <div className="font-bold text-sm text-slate-700">{stock.Pbr ?? '-'}</div>
                  </div>
                  <div className="p-2 rounded bg-slate-50">
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider">ROE</div>
                    <div className="font-bold text-sm text-slate-700">{stock.Roe ?? '-'}</div>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="max-w-7xl mx-auto mt-8 text-center text-slate-400 text-sm">
        <p>Data provided by Simulated IDX Feed • Updated: Just now</p>
      </div>
    </div>
  );
}

// Component Helper
const ScoreBar = ({ label, value, max, color }: { label: string, value: number, max: number, color: string }) => {
  const percentage = (value / max) * 100;
  return (
    <div className="flex items-center gap-3 text-xs">
      <span className="w-24 text-slate-500 font-medium truncate">{label}</span>
      <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full ${color} transition-all duration-500`} 
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="w-8 text-right font-bold text-slate-700">{value}</span>
    </div>
  );
}