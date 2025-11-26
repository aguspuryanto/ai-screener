"use client";

import React, { useState, useEffect } from 'react';
import { Search, TrendingUp, BarChart3, AlertCircle, Filter, ArrowUp, ArrowDown, Info, X } from 'lucide-react';
import { scoreStock } from '@/app/lib/ai';
import { StockData } from '@/modules/screener/types';
import DashboardSkeleton from '@/app/components/DashboardSkeleton';
// import Table from '@/app/components/Table';
import Link from 'next/link';



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

const FILTER_OPTIONS = ["ALL", "STRONG BUY", "BUY", "WATCHLIST", "HOLD", "AVOID", "TOP GAINER", "TOP VOLUME"] as const;

// Helper function to format numbers (e.g., 13660 -> "13.66 K")
const formatCompactNumber = (num: number | null | undefined): string => {
  if (num === null || num === undefined || isNaN(num)) return '-';
  
  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(2) + ' B';
  } else if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(2) + ' M';
  } else if (num >= 1_000) {
    return (num / 1_000).toFixed(2) + ' K';
  } else {
    return num.toFixed(2);
  }
};

export default function StockScreenerDashboard() {
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [filter, setFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedStock, setSelectedStock] = useState<StockData | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

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

  const filteredStocks = stocks
    .filter(stock => {
      const matchSearch = stock.Code.toLowerCase().includes(search.toLowerCase()) || 
                          stock.Name.toLowerCase().includes(search.toLowerCase());
      
      let matchFilter = true;
      if (filter === "ALL") {
        matchFilter = true;
      } else if (filter === "TOP GAINER") {
        matchFilter = (stock.OneDay * 100) > 5;
      } else if (filter === "TOP VOLUME") {
        matchFilter = ((stock as any).Volume || 0) > 1_000_000; // Volume > 1 M
      } else {
        matchFilter = stock.ai.label === filter;
      }
      
      return matchSearch && matchFilter;
    })
    .sort((a, b) => {
      // Sort by DESC when filter is "TOP GAINER"
      if (filter === "TOP GAINER") {
        return (b.OneDay * 100) - (a.OneDay * 100);
      }
      // Sort by DESC when filter is "TOP VOLUME"
      if (filter === "TOP VOLUME") {
        return ((b as any).Volume || 0) - ((a as any).Volume || 0);
      }
      return 0; // No sorting for other filters
    });

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-emerald-500 text-white";
    if (score >= 60) return "bg-blue-500 text-white";
    if (score >= 40) return "bg-yellow-500 text-white";
    return "bg-red-500 text-white";
  };

  const getStatusBadge = (label: string) => {
    const styles = {
      "STRONG BUY": "bg-emerald-100 text-emerald-700 border-emerald-200",
      "BUY": "bg-emerald-100 text-emerald-700 border-emerald-200",
      "WATCHLIST": "bg-yellow-100 text-yellow-700 border-yellow-200",
      "HOLD": "bg-blue-100 text-blue-700 border-blue-200",
      "AVOID": "bg-red-100 text-red-700 border-red-200",
      "CUT LOSS": "bg-red-100 text-red-700 border-red-200",
    };
    return styles[label as keyof typeof styles] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  if (loading)
    return <DashboardSkeleton />;

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

      {/* Search Bar & Filter */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex gap-3">
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
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium flex items-center gap-2 whitespace-nowrap shadow-sm"
          >
            <Filter className="w-5 h-5" />
            <span>Filter</span>
          </button>
        </div>
      </div>

      {/* Main Content with Sidebar */}
      <div className="max-w-7xl mx-auto flex gap-6 relative">
        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* <Table stocks={filteredStocks} /> */}
          <div>
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
                <Link href={`/detail/${stock.Code}`} className="block">
                {/* Card Header */}
                <div className="p-5 border-b border-slate-100">
                  <div className="flex justify-between items-start mb-3">
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
                  
                  {/* Volume & Value Info */}
                  <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                    <div className="flex-1">
                      <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Volume</div>
                      <div className="text-sm font-semibold text-slate-700">
                        {formatCompactNumber((stock as any).Volume)}
                      </div>
                    </div>
                    <div className="flex-1 text-right">
                      <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Value</div>
                      <div className="text-sm font-semibold text-slate-700">
                        {formatCompactNumber((stock as any).Value) !== '-' ? `Rp ${formatCompactNumber((stock as any).Value)}` : '-'}
                      </div>
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
                    <button
                      onClick={() => setSelectedStock(stock)}
                      className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1 transition-colors"
                      title="View breakdown details"
                    >
                      <Info className="w-4 h-4" />
                      info
                    </button>
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
                    <div className="font-bold text-sm text-slate-700">
                      {stock.Per !== null && stock.Per !== undefined ? stock.Per.toFixed(2) : '-'}
                    </div>
                  </div>
                  <div className="p-2 rounded bg-slate-50">
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider">PBR</div>
                    <div className="font-bold text-sm text-slate-700">
                      {stock.Pbr !== null && stock.Pbr !== undefined ? stock.Pbr.toFixed(2) : '-'}
                    </div>
                  </div>
                  <div className="p-2 rounded bg-slate-50">
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider">ROE</div>
                    <div className="font-bold text-sm text-slate-700">
                      {stock.Roe !== null && stock.Roe !== undefined ? (stock.Roe * 100).toFixed(2) + '%' : '-'}
                    </div>
                  </div>
                </div>
                </Link>

              </div>
            ))}
          </div>
        )}
          </div>
        </div>

        {/* Right Sidebar - Filters */}
        {sidebarOpen && (
          <aside className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-4 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Filter className="w-5 h-5 text-emerald-600" />
                  Filter
                </h2>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                  title="Close sidebar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Status</p>
              {FILTER_OPTIONS.map((f) => {
                const count = f === "ALL" 
                  ? stocks.length 
                  : f === "TOP GAINER"
                  ? stocks.filter(s => (s.OneDay * 100) > 5).length
                  : f === "TOP VOLUME"
                  ? stocks.filter(s => ((s as any).Volume || 0) > 1_000_000).length
                  : stocks.filter(s => s.ai.label === f).length;
                
                return (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`w-full text-left px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                      filter === f 
                        ? "bg-slate-800 text-white shadow-md" 
                        : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{f}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        filter === f 
                          ? "bg-white/20 text-white" 
                          : "bg-slate-200 text-slate-600"
                      }`}>
                        {count}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Stats Summary */}
            <div className="mt-6 pt-6 border-t border-slate-200">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Summary</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Total Stocks</span>
                  <span className="font-bold text-slate-800">{stocks.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Filtered</span>
                  <span className="font-bold text-slate-800">{filteredStocks.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Strong Buy</span>
                  <span className="font-bold text-emerald-600">
                    {stocks.filter(s => s.ai.label === "STRONG BUY").length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Buy</span>
                  <span className="font-bold text-emerald-600">
                    {stocks.filter(s => s.ai.label === "BUY").length}
                  </span>
                </div>
              </div>
            </div>
          </div>
          </aside>
        )}


        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div 
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setSidebarOpen(false)}
          >
            <aside 
              className="absolute right-0 top-0 h-full w-80 bg-white shadow-2xl overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Filter className="w-5 h-5 text-emerald-600" />
                    Filter
                  </h2>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Status</p>
                  {FILTER_OPTIONS.map((f) => {
                    const count = f === "ALL" 
                      ? stocks.length 
                      : f === "TOP GAINER"
                      ? stocks.filter(s => (s.OneDay * 100) > 5).length
                  : f === "TOP VOLUME"
                  ? stocks.filter(s => ((s as any).Volume || 0) > 1_000_000).length
                      : stocks.filter(s => s.ai.label === f).length;
                    
                    return (
                      <button
                        key={f}
                        onClick={() => {
                          setFilter(f);
                          setSidebarOpen(false);
                        }}
                        className={`w-full text-left px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                          filter === f 
                            ? "bg-slate-800 text-white shadow-md" 
                            : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{f}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            filter === f 
                              ? "bg-white/20 text-white" 
                              : "bg-slate-200 text-slate-600"
                          }`}>
                            {count}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Stats Summary */}
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Summary</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Total Stocks</span>
                      <span className="font-bold text-slate-800">{stocks.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Filtered</span>
                      <span className="font-bold text-slate-800">{filteredStocks.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Strong Buy</span>
                      <span className="font-bold text-emerald-600">
                        {stocks.filter(s => s.ai.label === "STRONG BUY").length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Buy</span>
                      <span className="font-bold text-emerald-600">
                        {stocks.filter(s => s.ai.label === "BUY").length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
      
      <div className="max-w-7xl mx-auto mt-8 text-center text-slate-400 text-sm">
        <p>Data provided by Simulated IDX Feed • Updated: Just now</p>
      </div>

      {/* Breakdown Detail Dialog */}
      {selectedStock && (
        <ScoreBreakdownDialog
          stock={selectedStock}
          onClose={() => setSelectedStock(null)}
        />
      )}
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

// Helper functions (moved outside component for reuse)
const getScoreColorHelper = (score: number) => {
  if (score >= 80) return "bg-emerald-500 text-white";
  if (score >= 60) return "bg-blue-500 text-white";
  if (score >= 40) return "bg-yellow-500 text-white";
  return "bg-red-500 text-white";
};

const getStatusBadgeHelper = (label: string) => {
  const styles = {
    "STRONG BUY": "bg-emerald-100 text-emerald-700 border-emerald-200",
    "BUY": "bg-emerald-100 text-emerald-700 border-emerald-200",
    "WATCHLIST": "bg-yellow-100 text-yellow-700 border-yellow-200",
    "HOLD": "bg-blue-100 text-blue-700 border-blue-200",
    "AVOID": "bg-red-100 text-red-700 border-red-200",
    "CUT LOSS": "bg-red-100 text-red-700 border-red-200",
  };
  return styles[label as keyof typeof styles] || "bg-gray-100 text-gray-700 border-gray-200";
};

// Score Breakdown Dialog Component
const ScoreBreakdownDialog = ({ stock, onClose }: { stock: StockData, onClose: () => void }) => {
  const { ai } = stock;
  // Type assertion untuk mengakses breakdown detail
  const aiDetails = ai as any;
  const factorColors = {
    trend: "bg-blue-500",
    momentum: "bg-purple-500",
    valuation: "bg-emerald-500",
    volume: "bg-orange-500",
    risk: "bg-red-500",
  };

  const factorLabels = {
    trend: "Trend Score",
    momentum: "Momentum Score",
    valuation: "Valuation Score",
    volume: "Volume & Demand Score",
    risk: "Risk Score",
  };

  const factorDescriptions = {
    trend: "Mengukur arah pergerakan harga berdasarkan return periodik",
    momentum: "Mengukur kekuatan pergerakan harga dan volatilitas",
    valuation: "Mengukur kelayakan harga berdasarkan fundamental",
    volume: "Mengukur minat beli berdasarkan volume dan frekuensi transaksi",
    risk: "Mengukur tingkat risiko berdasarkan beta dan volatilitas",
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Dialog Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-emerald-600" />
              Score Breakdown
            </h2>
            <div className="mt-2 flex items-center gap-3">
              <span className="text-lg font-bold text-slate-800">{stock.Code}</span>
              <span className="text-sm text-slate-500">{stock.Name}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Dialog Content */}
        <div className="p-6 space-y-6">
          {/* Total Score Summary */}
          <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg p-6 border border-emerald-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-slate-600">Total AI Score</span>
              <span className={`text-3xl font-bold px-4 py-2 rounded-full ${getScoreColorHelper(ai.score)}`}>
                {ai.score}/100
              </span>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-500">Status</span>
                <span className={`text-sm font-bold px-3 py-1 rounded border ${getStatusBadgeHelper(ai.label)}`}>
                  {ai.label}
                </span>
              </div>
              <div className="h-3 bg-slate-200 rounded-full overflow-hidden mt-2">
                <div 
                  className={`h-full ${getScoreColorHelper(ai.score)} transition-all duration-500`}
                  style={{ width: `${ai.score}%` }}
                />
              </div>
            </div>
          </div>

          {/* Factor Breakdown */}
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-4">5 Faktor Analisis</h3>
            <div className="space-y-4">
              <FactorDetail
                label={factorLabels.trend}
                value={aiDetails.trendScore || 0}
                max={20}
                color={factorColors.trend}
                description={factorDescriptions.trend}
              />
              <FactorDetail
                label={factorLabels.momentum}
                value={aiDetails.momentumScore || 0}
                max={20}
                color={factorColors.momentum}
                description={factorDescriptions.momentum}
              />
              <FactorDetail
                label={factorLabels.valuation}
                value={aiDetails.valuationScore || 0}
                max={20}
                color={factorColors.valuation}
                description={factorDescriptions.valuation}
              />
              <FactorDetail
                label={factorLabels.volume}
                value={aiDetails.volumeScore || 0}
                max={20}
                color={factorColors.volume}
                description={factorDescriptions.volume}
              />
              <FactorDetail
                label={factorLabels.risk}
                value={aiDetails.riskScore || 0}
                max={20}
                color={factorColors.risk}
                description={factorDescriptions.risk}
              />
            </div>
          </div>

          {/* Score Interpretation */}
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <h4 className="text-sm font-bold text-slate-700 mb-2">Interpretasi Score</h4>
            <div className="text-xs text-slate-600 space-y-1">
              <p>• <strong>85-100:</strong> STRONG BUY - Potensi kenaikan sangat tinggi</p>
              <p>• <strong>70-84:</strong> BUY - Potensi kenaikan tinggi</p>
              <p>• <strong>55-69:</strong> WATCHLIST - Perlu monitoring lebih lanjut</p>
              <p>• <strong>40-54:</strong> HOLD - Pertahankan posisi</p>
              <p>• <strong>&lt;40:</strong> AVOID - Risiko tinggi, hindari</p>
            </div>
          </div>
        </div>

        {/* Dialog Footer */}
        <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors font-medium"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

// Factor Detail Component
const FactorDetail = ({ 
  label, 
  value, 
  max, 
  color, 
  description 
}: { 
  label: string, 
  value: number, 
  max: number, 
  color: string,
  description: string
}) => {
  const percentage = (value / max) * 100;
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <h4 className="font-semibold text-slate-800 text-sm">{label}</h4>
          <p className="text-xs text-slate-500 mt-1">{description}</p>
        </div>
        <div className="text-right ml-4">
          <div className="text-2xl font-bold text-slate-800">{value}</div>
          <div className="text-xs text-slate-500">/ {max}</div>
        </div>
      </div>
      <div className="mt-3">
        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
          <div 
            className={`h-full ${color} transition-all duration-500`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}