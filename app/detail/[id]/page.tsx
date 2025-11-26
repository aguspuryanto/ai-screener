"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, ArrowUp, ArrowDown, BarChart3, TrendingUp, TrendingDown, Info, DollarSign, Activity, AlertCircle } from 'lucide-react';
import { scoreStock } from '@/app/lib/ai';
import { StockData } from '@/modules/screener/types';
import Link from 'next/link';

// Helper function to format numbers
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

const formatCurrency = (num: number | null | undefined): string => {
  if (num === null || num === undefined || isNaN(num)) return '-';
  return `Rp ${num.toLocaleString('id-ID')}`;
};

const formatPercent = (num: number | null | undefined): string => {
  if (num === null || num === undefined || isNaN(num)) return '-';
  return `${(num * 100).toFixed(2)}%`;
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

// Score Bar Component
const ScoreBar = ({ label, value, max, color }: { label: string, value: number, max: number, color: string }) => {
  const percentage = (value / max) * 100;
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-32 text-slate-600 font-medium truncate">{label}</span>
      <div className="flex-1 h-3 bg-slate-200 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full ${color} transition-all duration-500`} 
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="w-12 text-right font-bold text-slate-700">{value}/{max}</span>
    </div>
  );
};

export default function StockDetailPage() {
  const params = useParams();
  const router = useRouter();
  const stockCode = params.id as string;
  
  const [stock, setStock] = useState<StockData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStock = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/stocks");
        const json = await res.json();
        
        if (json.success) {
          const foundStock = json.data.find((s: any) => s.Code === stockCode);
          
          if (foundStock) {
            const enriched = {
              ...foundStock,
              ai: scoreStock(foundStock),
            };
            setStock(enriched as StockData);
          } else {
            setError("Stock not found");
          }
        } else {
          setError("Failed to fetch stock data");
        }
      } catch (err) {
        console.error("Error:", err);
        setError("An error occurred while fetching data");
      } finally {
        setLoading(false);
      }
    };

    if (stockCode) {
      fetchStock();
    }
  }, [stockCode]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading stock data...</p>
        </div>
      </div>
    );
  }

  if (error || !stock) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Stock Not Found</h2>
          <p className="text-slate-600 mb-6">{error || "The stock you're looking for doesn't exist."}</p>
          <Link 
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const aiDetails = stock.ai as any;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link 
              href="/"
              className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Dashboard</span>
            </Link>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-emerald-600" />
              <span className="text-sm font-semibold text-slate-500">IDX AI Screener</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Stock Header Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-6 overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl md:text-4xl font-bold text-slate-800">{stock.Code}</h1>
                  <span className={`text-sm font-bold px-3 py-1 rounded border ${getStatusBadge(stock.ai.label)}`}>
                    {stock.ai.label}
                  </span>
                </div>
                <h2 className="text-lg text-slate-600 mb-4">{stock.Name}</h2>
                
                {/* Price Section */}
                <div className="flex items-baseline gap-4">
                  <div>
                    <div className="text-4xl font-bold text-slate-800">
                      {stock.Last.toLocaleString('id-ID')}
                    </div>
                    <div className={`text-lg font-medium flex items-center gap-1 mt-1 ${stock.OneDay >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {stock.OneDay >= 0 ? <ArrowUp className="w-5 h-5"/> : <ArrowDown className="w-5 h-5"/>}
                      {formatPercent(stock.OneDay)}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* AI Score Badge */}
              <div className="text-center">
                <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">AI Score</div>
                <div className={`text-5xl font-bold px-6 py-4 rounded-2xl ${getScoreColor(stock.ai.score)}`}>
                  {stock.ai.score}
                </div>
                <div className="text-xs text-slate-500 mt-2">out of 100</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* AI Score Breakdown */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-emerald-600" />
                AI Score Breakdown
              </h3>
              
              <div className="space-y-4">
                <ScoreBar 
                  label="Trend Score" 
                  value={aiDetails.trendScore || 0} 
                  max={20} 
                  color="bg-blue-500" 
                />
                <ScoreBar 
                  label="Momentum Score" 
                  value={aiDetails.momentumScore || 0} 
                  max={20} 
                  color="bg-purple-500" 
                />
                <ScoreBar 
                  label="Valuation Score" 
                  value={aiDetails.valuationScore || 0} 
                  max={20} 
                  color="bg-emerald-500" 
                />
                <ScoreBar 
                  label="Volume & Demand Score" 
                  value={aiDetails.volumeScore || 0} 
                  max={20} 
                  color="bg-orange-500" 
                />
                <ScoreBar 
                  label="Risk Score" 
                  value={aiDetails.riskScore || 0} 
                  max={20} 
                  color="bg-red-500" 
                />
              </div>

              <div className="mt-6 pt-6 border-t border-slate-200">
                <div className="bg-slate-50 rounded-lg p-4">
                  <h4 className="text-sm font-bold text-slate-700 mb-3">Score Interpretation</h4>
                  <div className="text-xs text-slate-600 space-y-1">
                    <p>• <strong>85-100:</strong> STRONG BUY - Potensi kenaikan sangat tinggi</p>
                    <p>• <strong>70-84:</strong> BUY - Potensi kenaikan tinggi</p>
                    <p>• <strong>55-69:</strong> WATCHLIST - Perlu monitoring lebih lanjut</p>
                    <p>• <strong>40-54:</strong> HOLD - Pertahankan posisi</p>
                    <p>• <strong>&lt;40:</strong> AVOID - Risiko tinggi, hindari</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Price & Volume Information */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Activity className="w-6 h-6 text-emerald-600" />
                Trading Information
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Volume</div>
                  <div className="text-lg font-bold text-slate-800">
                    {formatCompactNumber((stock as any).Volume)}
                  </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Value</div>
                  <div className="text-lg font-bold text-slate-800">
                    {formatCompactNumber((stock as any).Value) !== '-' ? `Rp ${formatCompactNumber((stock as any).Value)}` : '-'}
                  </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Frequency</div>
                  <div className="text-lg font-bold text-slate-800">
                    {((stock as any).Frequency || 0).toLocaleString('id-ID')}
                  </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Capitalization</div>
                  <div className="text-lg font-bold text-slate-800">
                    {formatCompactNumber((stock as any).Capitalization)}
                  </div>
                </div>
              </div>
            </div>

            {/* Return Performance */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-emerald-600" />
                Return Performance
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">1 Day</div>
                  <div className={`text-lg font-bold flex items-center gap-1 ${(stock as any).OneDay >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {(stock as any).OneDay >= 0 ? <TrendingUp className="w-4 h-4"/> : <TrendingDown className="w-4 h-4"/>}
                    {formatPercent((stock as any).OneDay)}
                  </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">1 Week</div>
                  <div className={`text-lg font-bold flex items-center gap-1 ${(stock as any).OneWeek >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {(stock as any).OneWeek >= 0 ? <TrendingUp className="w-4 h-4"/> : <TrendingDown className="w-4 h-4"/>}
                    {formatPercent((stock as any).OneWeek)}
                  </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">1 Month</div>
                  <div className={`text-lg font-bold flex items-center gap-1 ${(stock as any).OneMonth >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {(stock as any).OneMonth >= 0 ? <TrendingUp className="w-4 h-4"/> : <TrendingDown className="w-4 h-4"/>}
                    {formatPercent((stock as any).OneMonth)}
                  </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">3 Months</div>
                  <div className={`text-lg font-bold flex items-center gap-1 ${(stock as any).ThreeMonth >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {(stock as any).ThreeMonth >= 0 ? <TrendingUp className="w-4 h-4"/> : <TrendingDown className="w-4 h-4"/>}
                    {formatPercent((stock as any).ThreeMonth)}
                  </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">6 Months</div>
                  <div className={`text-lg font-bold flex items-center gap-1 ${(stock as any).SixMonth >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {(stock as any).SixMonth >= 0 ? <TrendingUp className="w-4 h-4"/> : <TrendingDown className="w-4 h-4"/>}
                    {formatPercent((stock as any).SixMonth)}
                  </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">1 Year</div>
                  <div className={`text-lg font-bold flex items-center gap-1 ${(stock as any).OneYear >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {(stock as any).OneYear >= 0 ? <TrendingUp className="w-4 h-4"/> : <TrendingDown className="w-4 h-4"/>}
                    {formatPercent((stock as any).OneYear)}
                  </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">MTD</div>
                  <div className={`text-lg font-bold flex items-center gap-1 ${(stock as any).Mtd >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {(stock as any).Mtd >= 0 ? <TrendingUp className="w-4 h-4"/> : <TrendingDown className="w-4 h-4"/>}
                    {formatPercent((stock as any).Mtd)}
                  </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">YTD</div>
                  <div className={`text-lg font-bold flex items-center gap-1 ${(stock as any).Ytd >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {(stock as any).Ytd >= 0 ? <TrendingUp className="w-4 h-4"/> : <TrendingDown className="w-4 h-4"/>}
                    {formatPercent((stock as any).Ytd)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Fundamental Metrics */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <DollarSign className="w-6 h-6 text-emerald-600" />
                Fundamental Metrics
              </h3>
              
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">PER</div>
                  <div className="text-2xl font-bold text-slate-800">
                    {stock.Per !== null && stock.Per !== undefined ? stock.Per.toFixed(2) : '-'}
                  </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">PBR</div>
                  <div className="text-2xl font-bold text-slate-800">
                    {stock.Pbr !== null && stock.Pbr !== undefined ? stock.Pbr.toFixed(2) : '-'}
                  </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">ROE</div>
                  <div className="text-2xl font-bold text-slate-800">
                    {stock.Roe !== null && stock.Roe !== undefined ? (stock.Roe * 100).toFixed(2) + '%' : '-'}
                  </div>
                </div>
                {(stock as any).PsrAnnualized && (
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">PSR (Annualized)</div>
                    <div className="text-2xl font-bold text-slate-800">
                      {(stock as any).PsrAnnualized.toFixed(2)}
                    </div>
                  </div>
                )}
                {(stock as any).PcfrAnnualized && (
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">PCFR (Annualized)</div>
                    <div className="text-2xl font-bold text-slate-800">
                      {(stock as any).PcfrAnnualized.toFixed(2)}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Risk Metrics */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <AlertCircle className="w-6 h-6 text-emerald-600" />
                Risk Metrics
              </h3>
              
              <div className="space-y-4">
                {(stock as any).BetaOneYear !== null && (stock as any).BetaOneYear !== undefined && (
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Beta (1 Year)</div>
                    <div className="text-2xl font-bold text-slate-800">
                      {(stock as any).BetaOneYear.toFixed(3)}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {(stock as any).BetaOneYear < 0.7 ? 'Low Risk' : (stock as any).BetaOneYear > 1.2 ? 'High Risk' : 'Moderate Risk'}
                    </div>
                  </div>
                )}
                {(stock as any).StdevOneYear !== null && (stock as any).StdevOneYear !== undefined && (
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Volatility (1 Year)</div>
                    <div className="text-2xl font-bold text-slate-800">
                      {formatPercent((stock as any).StdevOneYear)}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {(stock as any).StdevOneYear < 0.35 ? 'Low Volatility' : (stock as any).StdevOneYear > 0.50 ? 'High Volatility' : 'Moderate Volatility'}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Price Information */}
            {(stock as any).PrevClosingPrice && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h3 className="text-xl font-bold text-slate-800 mb-6">Price Information</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-sm text-slate-600">Previous Close</span>
                    <span className="font-bold text-slate-800">
                      {((stock as any).PrevClosingPrice || 0).toLocaleString('id-ID')}
                    </span>
                  </div>
                  {(stock as any).AdjustedOpenPrice && (
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-sm text-slate-600">Open</span>
                      <span className="font-bold text-slate-800">
                        {((stock as any).AdjustedOpenPrice || 0).toLocaleString('id-ID')}
                      </span>
                    </div>
                  )}
                  {(stock as any).AdjustedHighPrice && (
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-sm text-slate-600">High</span>
                      <span className="font-bold text-emerald-600">
                        {((stock as any).AdjustedHighPrice || 0).toLocaleString('id-ID')}
                      </span>
                    </div>
                  )}
                  {(stock as any).AdjustedLowPrice && (
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-sm text-slate-600">Low</span>
                      <span className="font-bold text-red-600">
                        {((stock as any).AdjustedLowPrice || 0).toLocaleString('id-ID')}
                      </span>
                    </div>
                  )}
                  {(stock as any).AdjustedAnnualHighPrice && (
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-sm text-slate-600">52W High</span>
                      <span className="font-bold text-emerald-600">
                        {((stock as any).AdjustedAnnualHighPrice || 0).toLocaleString('id-ID')}
                      </span>
                    </div>
                  )}
                  {(stock as any).AdjustedAnnualLowPrice && (
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-slate-600">52W Low</span>
                      <span className="font-bold text-red-600">
                        {((stock as any).AdjustedAnnualLowPrice || 0).toLocaleString('id-ID')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

