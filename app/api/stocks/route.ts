import { NextResponse } from "next/server";
import fs from 'node:fs/promises';
import path from 'node:path';

export const dynamic = 'force-dynamic';

export async function GET() {
  const url = "https://pasardana.id/api/StockSearchResult/GetAll?pageBegin=0&pageLength=1000&sortField=Code&sortOrder=ASC";

  const PATH_DATA = "public/data";
  const CURR_DATE = new Date().toISOString().slice(0, 10);
  const CACHE_FILE = path.join(process.cwd(), PATH_DATA, `stocks_${CURR_DATE}.json`);
  const MAX_AGE_MS = 14 * 60 * 60 * 1000; // 14 hours cache

  try {
    try {
      const stat = await fs.stat(CACHE_FILE);
      if (Date.now() - stat.mtimeMs < MAX_AGE_MS) {
        const cached = JSON.parse(await fs.readFile(CACHE_FILE, "utf-8"));
        return NextResponse.json({ success: true, data: cached.data });
      }
    } catch {}
    const response = await fetch(url, {
      next: { 
        revalidate: 3600 * 24, // Revalidate every hour
        tags: ['stocks']
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch stocks: ${response.statusText}`);
    }

    const data = await response.json();

    await fs.mkdir(path.dirname(CACHE_FILE), { recursive: true });
    await fs.writeFile(
      CACHE_FILE,
      JSON.stringify({ savedAt: new Date().toISOString(), data }),
      "utf-8"
    );
    return NextResponse.json({ success: true, data });
    
  } catch (error) {
    console.error('Error fetching stocks:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch stocks' 
      },
      { status: 500 }
    );
  }
}
