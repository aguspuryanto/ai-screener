import { NextResponse } from "next/server";
import axios from "axios";
import fs from "node:fs/promises";
import path from "node:path";

const CACHE_DIR = path.join(process.cwd(), "public", "yahoo-cache");
const MAX_AGE_MS = 15 * 60 * 1000; // 15 minutes cache

function getCacheFile(symbol: string) {
  return path.join(CACHE_DIR, `${symbol.toUpperCase()}.json`);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol");

  if (!symbol) {
    return NextResponse.json(
      { success: false, error: "Missing symbol query parameter" },
      { status: 400 }
    );
  }

  const CACHE_FILE = getCacheFile(symbol);
  try {
    try {
      const stat = await fs.stat(CACHE_FILE);
      if (Date.now() - stat.mtimeMs < MAX_AGE_MS) {
        const cached = JSON.parse(await fs.readFile(CACHE_FILE, "utf-8"));
        return NextResponse.json({ success: true, data: cached.data });
      }
    } catch {}

    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(
      symbol
    )}`;
    const { data } = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        Accept: "application/json",
      },
    });

    const result = data?.quoteResponse?.result?.[0] || null;

    await fs.mkdir(path.dirname(CACHE_FILE), { recursive: true });
    await fs.writeFile(
      CACHE_FILE,
      JSON.stringify({ savedAt: new Date().toISOString(), data: result }),
      "utf-8"
    );

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    try {
      const cached = JSON.parse(await fs.readFile(CACHE_FILE, "utf-8"));
      return NextResponse.json({ success: true, data: cached.data });
    } catch {
      return NextResponse.json(
        { success: false, error: "Failed to fetch Yahoo Finance data" },
        { status: 500 }
      );
    }
  }
}