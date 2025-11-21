"use client";
import { useState, useEffect } from "react";
import InputBox from "@/app/components/InputBox";
import ScreenerResult from "./ScreenerResult";
import { stockbitScreener } from "@/app/lib/stockbitScreener";
import { StockData } from '@/modules/screener/types';

type DummyStock = {
  ROE: number;
  ROA: number;
  NPM: number;
  DER: number;
  PER: number;
  PBV: number;
  EPSGrowth: number;
  RevenueGrowth: number;
  NetProfitGrowth: number;
  OneMonth: number;
  ThreeMonth: number;
  BetaOneYear: number;
  StdevOneYear: number;
  AvgVolume: number;
  AvgValue: number;
};

type ScreenerOutput = ReturnType<typeof stockbitScreener>;

export default function ScreenPage() {
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [code, setCode] = useState<string>("");
  const [result, setResult] = useState<ScreenerOutput | null>(null);
  
  const fetchStocks = async () => {
    try {
      const res = await fetch("/api/stocks");
      const json = await res.json();
      if (json.success) {
        const enriched = json.data.map((s: any) => ({
          ...s,
        }));
        setStocks(enriched);
      }
    } catch (err) {
      console.error("Error:", err);
    }
    // setLoading(false);
  };

  useEffect(() => {
    fetchStocks();
  }, []);

  const onSubmit = async () => {
    // const dummyStock: DummyStock = {
    //   ROE: 0.18,
    //   ROA: 0.09,
    //   NPM: 0.11,
    //   DER: 0.5,
    //   PER: 10,
    //   PBV: 1.2,
    //   EPSGrowth: 0.15,
    //   RevenueGrowth: 0.2,
    //   NetProfitGrowth: 0.25,
    //   OneMonth: 0.06,
    //   ThreeMonth: 0.12,
    //   BetaOneYear: 0.8,
    //   StdevOneYear: 0.25,
    //   AvgVolume: 5_000_000,
    //   AvgValue: 30_000_000_000,
    // };

    const dummyStock = stocks.find((s) => s.Code === code);
    if (!dummyStock) {
      console.error("Stock not found");
      return;
    }

    console.log(dummyStock);
    const screen = stockbitScreener(dummyStock);
    setResult(screen);
  };

  return (
    <div className="max-w-xl mx-auto p-6 space-y-4">
      <h1 className="text-3xl font-bold">Stockbit Screener</h1>

      <InputBox value={code} onChange={setCode} />

      <button
        onClick={onSubmit}
        className="bg-black text-white px-4 py-2 rounded-lg w-full text-lg mt-2"
      >
        Screener
      </button>

      {result && <ScreenerResult data={result} />}
    </div>
  );
}
