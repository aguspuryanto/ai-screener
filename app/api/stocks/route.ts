import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
  const url = "https://pasardana.id/api/StockSearchResult/GetAll?pageBegin=0&pageLength=1000&sortField=Code&sortOrder=ASC";
  
  try {
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
