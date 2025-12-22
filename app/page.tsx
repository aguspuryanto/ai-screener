"use client";

import React, { useState, useEffect } from 'react';
import { Search, TrendingUp, BarChart3, AlertCircle, Filter, ArrowUp, ArrowDown, Info, X } from 'lucide-react';
import { scoreStock } from '@/app/lib/ai';
import { StockData } from '@/modules/screener/types';
import DashboardSkeleton from '@/app/components/DashboardSkeleton';
import StockTable from '@/app/components/StockTable';
import StockCard from '@/app/components/StockCard';
import { ScoreBreakdownDialog } from '@/app/components/StockDialog';
import Link from 'next/link';

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

const formatDateTime = (dateString: string | null | undefined): string => {
  if (!dateString) return 'Baru saja';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Baru saja';
  
  return date.toLocaleString('id-ID', {
    timeZone: 'Asia/Jakarta',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
};

export default function StockScreenerDashboard() {
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [filter, setFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedStock, setSelectedStock] = useState<StockData | null>(null);
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('Just now');

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
        // Update lastUpdated if available, otherwise use current time
        setLastUpdated(json.updatedAt ? formatDateTime(json.updatedAt) : 'Baru saja');
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
          {/* View Mode Toggle */}
          <div className="flex justify-end mb-4">
            <div className="inline-flex rounded-md shadow-sm" role="group">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`px-4 py-2 text-sm font-medium rounded-l-lg border ${
                  viewMode === 'table' 
                    ? 'bg-emerald-100 text-emerald-700 border-emerald-300' 
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Table View
              </button>
              <button
                type="button"
                onClick={() => setViewMode('card')}
                className={`px-4 py-2 text-sm font-medium rounded-r-lg border ${
                  viewMode === 'card' 
                    ? 'bg-emerald-100 text-emerald-700 border-emerald-300' 
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Card View
              </button>
            </div>
          </div>

          {/* Content */}
          <div>
            {loading ? (
              <div className="text-center py-20 text-slate-400">Loading AI Analysis...</div>
            ) : filteredStocks.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300 text-slate-400">
                No stocks found matching criteria.
              </div>
            ) : viewMode === 'table' ? (
              <StockTable stocks={filteredStocks} onInfoClick={setSelectedStock} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStocks.map((stock) => (
                  <StockCard 
                    key={stock.Code} 
                    stock={stock} 
                    onInfoClick={setSelectedStock} 
                  />
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
      
      {/* Footer */}
      <div className="max-w-7xl mx-auto mt-8 text-center text-slate-400 text-sm space-y-2">
        <p>Data provided by Simulated IDX Feed • Updated: {lastUpdated}</p>
        <div className="text-xs text-slate-400 w-full mt-2 p-2 bg-slate-50 rounded-lg space-y-2">
          <p className="font-medium text-slate-600 mb-2">Penting untuk Diketahui:</p>
          <p className="text-slate-500 text-justify mb-3">
            Data dan analisis yang ditampilkan di halaman ini hanya untuk tujuan informasi dan referensi belaka, 
            bukan merupakan rekomendasi untuk membeli, menjual, atau menahan saham. 
            Lakukan riset mandiri atau konsultasikan dengan penasihat keuangan sebelum membuat keputusan investasi.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-left">
            <div>
              <p className="font-medium text-slate-600">Keterangan Metrik:</p>
              <ul className="mt-1 space-y-1">
                <li><span className="font-medium">PER (Price to Earnings Ratio):</span> Rasio harga saham terhadap laba per saham. 
                  <br/><span className="text-emerald-600">Baik: Rendah (di bawah rata-rata industri)</span></li>
                <li><span className="font-medium">PBR (Price to Book Value):</span> Rasio harga saham terhadap nilai buku.
                  <br/><span className="text-emerald-600">Baik: Di bawah 1 (menunjukkan harga di bawah nilai buku)</span></li>
                <li><span className="font-medium">ROE (Return on Equity):</span> Tingkat pengembalian modal sendiri.
                  <br/><span className="text-emerald-600">Baik: Tinggi (di atas 15-20% per tahun)</span></li>
                <li><span className="font-medium">AI Score:</span> Skor prediksi berbasis AI (0-100).
                  <br/><span className="text-emerald-600">Baik: Di atas 70</span></li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-slate-600">Kategori AI Signal:</p>
              <ul className="mt-1 space-y-1">
                <li><span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-xs">STRONG BUY</span> - Potensi kenaikan tinggi</li>
                <li><span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs">BUY</span> - Potensi kenaikan</li>
                <li><span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 text-xs">WATCHLIST</span> - Perlu dipantau</li>
                <li><span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-xs">HOLD</span> - Tahan dulu</li>
                <li><span className="px-2 py-0.5 rounded bg-red-50 text-red-700 text-xs">AVOID</span> - Berisiko tinggi</li>
              </ul>
            </div>
          </div>
        </div>
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