import { NextResponse } from "next/server";
import axios from "axios";
import fs from "node:fs/promises";
import path from "node:path";

export async function GET() {
  const PATH_DATA = "public/data";
  const CURR_DATE = new Date().toISOString().slice(0, 10);
  const CACHE_FILE = path.join(process.cwd(), PATH_DATA, `stocks_${CURR_DATE}.json`);
  const MAX_AGE_MS = 14 * 60 * 60 * 1000;
  try {
    try {
      const stat = await fs.stat(CACHE_FILE);
      if (Date.now() - stat.mtimeMs < MAX_AGE_MS) {
        const cached = JSON.parse(await fs.readFile(CACHE_FILE, "utf-8"));
        return NextResponse.json({ success: true, data: cached.data });
      }
    } catch {}

    const url =
      "https://pasardana.id/api/StockSearchResult/GetAll?pageBegin=0&pageLength=1000&sortField=Code&sortOrder=ASC";
    const { data } = await axios.get(url);

    await fs.mkdir(path.dirname(CACHE_FILE), { recursive: true });
    await fs.writeFile(
      CACHE_FILE,
      JSON.stringify({ savedAt: new Date().toISOString(), data }),
      "utf-8"
    );

    return NextResponse.json({ success: true, data });
  } catch (error) {
    try {
      const cached = JSON.parse(
        await fs.readFile(CACHE_FILE, "utf-8")
      );
      return NextResponse.json({ success: true, data: cached.data });
    } catch {
      return NextResponse.json(
        { success: false, error: "Failed to fetch stocks" },
        { status: 500 }
      );
    }
  }
}
