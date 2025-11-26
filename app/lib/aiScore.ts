// export interface StockData {
//     Code: string;
//     Last: number;
//     OneDay: number;
//     OneWeek: number;
//     OneMonth: number;
//     Volume: number;
//     Value: number;
//     Per?: number | null;
//     Roe?: number | null;
//     Vma20?: number | null; // optional jika nanti ada
//   }
  
/* ---- SWING TRADING AI SCORING MODEL ----
Momentum      40%
Volume/Value  25%
Trend 1W      15%
Trend 1M      10%
Fundamental   10%
------------------------------------------ */
  
export function getAiScoreSwing(stock: any) {
    // Extract all fields safely
    const {
        Last,
        PrevClosingPrice,
        OneDay,
        OneWeek,
        OneMonth,
        ThreeMonth,
        SixMonth,
        Mtd,
        Ytd,
        Volume,
        Frequency,
        Value,
        Per,
        Pbr,
        PsrAnnualized,
        Roe,
        BetaOneYear,
        StdevOneYear,
    } = stock;

    let score = 0;
  
    // 1️⃣ Momentum (One Day Gain)
    if (stock.OneDay > 0.03) score += 15;
    if (stock.OneDay > 0.05) score += 25;
    if (stock.OneDay > 0.08) score += 40;
  
    // 2️⃣ Volume / Value
    if (stock.Volume > 1_000_000) score += 7;
    if (stock.Volume > 5_000_000) score += 15;
    if (stock.Value > 5_000_000_000) score += 10;
    if (stock.Vma20 && stock.Volume > stock.Vma20 * 1.5) score += 8;
  
    // 3️⃣ Short Trend (One Week)
    if (stock.OneWeek > 0.02) score += 10;
    if (stock.OneWeek > 0.05) score += 15;
  
    // 4️⃣ Longer Swing Trend (One Month)
    if (stock.OneMonth > 0.04) score += 5;
    if (stock.OneMonth > 0.08) score += 10;
  
    // 5️⃣ Fundamental (optional)
    if (stock.Roe && stock.Roe > 0.08) score += 6;
    if (stock.Per && stock.Per < 20 && stock.Per > 0) score += 4;
  
    return Math.min(score, 100); // maksimum 100
}
  