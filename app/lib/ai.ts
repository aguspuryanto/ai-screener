// /*
// Struktur Data API Pasardana:
//     ✔ Harga & OHLC
//     Last
//     PrevClosingPrice
//     AdjustedOpenPrice
//     AdjustedHighPrice
//     AdjustedLowPrice

//     ✔ Volume & Nilai
//     Volume
//     Frequency
//     Value

//     ✔ Return Periodik
//     OneDay, OneWeek, OneMonth
//     ThreeMonth, SixMonth, OneYear
//     Mtd, Ytd

//     ✔ Valuasi
//     Per
//     Pbr
//     PsrAnnualized
//     PcfrAnnualized

//     ✔ Risiko
//     BetaOneYear
//     StdevOneYear

//     ✔ Fundamental
//     Roe
//     Capitalization

// AI Screener Model — 5 Faktor Utama
//     Faktor 1 — Trend Score (0–20)
//     Menggunakan return periodik:
//     | Kondisi           | Score |
//     | ----------------- | ----- |
//     | 1 hari > 0        | +3    |
//     | 1 minggu > 0      | +4    |
//     | 1 bulan > 0       | +5    |
//     | 3 bulan > 0       | +5    |
//     | Harga > PrevClose | +3    |

//     Faktor 2 — Momentum Score (0–20)
//     - Return 1 bulan positif + return 3 bulan positif → momentum kuat
//     - Beta kecil → stabil tetapi tidak agresif
//     - Volatilitas sedang → momentum sehat
//     | Kondisi             | Score          |
//     | ------------------- | -------------- |
//     | OneMonth > 5%       | +8             |
//     | ThreeMonth > 10%    | +10            |
//     | StdevOneYear < 0.40 | +4             |
//     | BetaOneYear 0.8–1.2 | +3             |
//     | BetaOneYear < 0.6   | +1 (defensive) |

//     Faktor 3 — Valuation Score (0–20)
//     Semakin murah semakin bagus
//     | Kondisi    | Score |
//     | ---------- | ----- |
//     | PER < 8    | +8    |
//     | PER 8–12   | +6    |
//     | PBV < 1    | +6    |
//     | PSR rendah | +4    |
//     | ROE > 10%  | +4    |

//     Faktor 4 — Volume & Demand Score (0–20)
//     Volume tinggi menandakan minat BUY meningkat
//     | Kondisi                                          | Score |
//     | ------------------------------------------------ | ----- |
//     | Volume > nilai rata-rata sektor (jika diketahui) | +10   |
//     | Value > 5 M                                      | +5    |
//     | Frequency > 1000                                 | +5    |

//     Faktor 5 — Risk Score (0–20)
//     Risiko rendah = lebih stabil, risiko tinggi = potensi besar tapi berbahaya
//     | Kondisi                | Score |
//     | ---------------------- | ----- |
//     | Beta < 0.7             | +8    |
//     | StdevOneYear < 0.35    | +6    |
//     | Harga dekat annual low | +6    |

//     Total Score = 100
//     | Score  | Status         |
//     | ------ | -------------- |
//     | 85–100 | **STRONG BUY** |
//     | 70–84  | **BUY**        |
//     | 55–69  | **WATCHLIST**  |
//     | 40–54  | **HOLD**       |
//     | <40    | **AVOID**      |
// */

// export function scoreStock(stock: any) {
//   const {
//     Last,
//     PrevClosingPrice,
//     OneDay,
//     OneWeek,
//     OneMonth,
//     ThreeMonth,
//     Per,
//     Pbr,
//     PsrAnnualized,
//     Roe,
//     BetaOneYear,
//     StdevOneYear,
//     Volume,
//     Value,
//     Frequency,
//     AdjustedAnnualLowPrice,
//   } = stock;

//   // Faktor 1 — Trend Score (0–20)
//   let trendScore = 0;
//   if (OneDay !== null && OneDay > 0) trendScore += 3;
//   if (OneWeek !== null && OneWeek > 0) trendScore += 4;
//   if (OneMonth !== null && OneMonth > 0) trendScore += 5;
//   if (ThreeMonth !== null && ThreeMonth > 0) trendScore += 5;
//   if (Last !== null && PrevClosingPrice !== null && Last > PrevClosingPrice) trendScore += 3;
//   trendScore = Math.min(trendScore, 20); // Cap at 20

//   // Faktor 2 — Momentum Score (0–20)
//   let momentumScore = 0;
//   if (OneMonth !== null && OneMonth > 0.05) momentumScore += 8;
//   if (ThreeMonth !== null && ThreeMonth > 0.10) momentumScore += 10;
//   if (StdevOneYear !== null && StdevOneYear < 0.40) momentumScore += 4;
//   if (BetaOneYear !== null) {
//     if (BetaOneYear >= 0.8 && BetaOneYear <= 1.2) momentumScore += 3;
//     else if (BetaOneYear < 0.6) momentumScore += 1; // defensive
//   }
//   momentumScore = Math.min(momentumScore, 20); // Cap at 20

//   // Faktor 3 — Valuation Score (0–20)
//   let valuationScore = 0;
//   if (Per !== null) {
//     if (Per < 8) valuationScore += 8;
//     else if (Per >= 8 && Per <= 12) valuationScore += 6;
//   }
//   if (Pbr !== null && Pbr < 1) valuationScore += 6;
//   if (PsrAnnualized !== null && PsrAnnualized < 1) valuationScore += 4; // PSR rendah
//   if (Roe !== null && Roe > 0.10) valuationScore += 4;
//   valuationScore = Math.min(valuationScore, 20); // Cap at 20

//   // Faktor 4 — Volume & Demand Score (0–20)
//   let volumeScore = 0;
//   // Value > 5 M (5,000,000,000)
//   if (Value !== null && Value > 5000000000) volumeScore += 5;
//   // Frequency > 1000
//   if (Frequency !== null && Frequency > 1000) volumeScore += 5;
//   // Volume tinggi relatif (karena tidak ada data sektor, gunakan threshold absolut)
//   // Asumsi: volume > 1M shares dianggap tinggi
//   if (Volume !== null && Volume > 1000000) volumeScore += 10;
//   volumeScore = Math.min(volumeScore, 20); // Cap at 20

//   // Faktor 5 — Risk Score (0–20)
//   let riskScore = 0;
//   if (BetaOneYear !== null && BetaOneYear < 0.7) riskScore += 8;
//   if (StdevOneYear !== null && StdevOneYear < 0.35) riskScore += 6;
//   // Harga dekat annual low (dalam 10% dari low)
//   if (Last !== null && AdjustedAnnualLowPrice !== null) {
//     const distanceFromLow = (Last - AdjustedAnnualLowPrice) / AdjustedAnnualLowPrice;
//     if (distanceFromLow <= 0.10) riskScore += 6;
//   }
//   riskScore = Math.min(riskScore, 20); // Cap at 20

//   // Total Score
//   const totalScore = trendScore + momentumScore + valuationScore + volumeScore + riskScore;

//   // Final label berdasarkan total score
//   let label = "HOLD";
//   if (totalScore >= 85) label = "STRONG BUY";
//   else if (totalScore >= 70) label = "BUY";
//   else if (totalScore >= 55) label = "WATCHLIST";
//   else if (totalScore >= 40) label = "HOLD";
//   else label = "AVOID";

//   return {
//     score: totalScore,
//     label,
//     details: {
//       trend: trendScore,
//       momentum: momentumScore,
//       valuation: valuationScore,
//       volume: volumeScore,
//       risk: riskScore,
//     },
//   };
// }
export function scoreStock(stock: any) {
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

  let trendScore = 0;
  let momentumScore = 0;
  let valuationScore = 0;
  let volumeScore = 0;
  let riskScore = 0;

  // ----------------------------
  // 1. TREND SCORE (0–20)
  // ----------------------------
  if (OneDay > 0) trendScore += 3;
  if (OneWeek > 0) trendScore += 4;
  if (OneMonth > 0) trendScore += 5;
  if (ThreeMonth > 0) trendScore += 5;
  if (Last > PrevClosingPrice) trendScore += 3;

  // ----------------------------
  // 2. MOMENTUM SCORE (0–20)
  // ----------------------------
  if (OneMonth > 0.05) momentumScore += 8;
  if (ThreeMonth > 0.10) momentumScore += 10;
  if (StdevOneYear < 0.40) momentumScore += 4;

  if (BetaOneYear >= 0.8 && BetaOneYear <= 1.2) momentumScore += 3;
  else if (BetaOneYear < 0.6) momentumScore += 1;

  // ----------------------------
  // 3. VALUATION SCORE (0–20)
  // ----------------------------
  if (Per < 8) valuationScore += 8;
  else if (Per >= 8 && Per <= 12) valuationScore += 6;

  if (Pbr < 1) valuationScore += 6;

  if (PsrAnnualized && PsrAnnualized < 1.5) valuationScore += 4; // PSR rendah

  if (Roe > 0.10) valuationScore += 4;

  // ----------------------------
  // 4. VOLUME & DEMAND SCORE (0–20)
  // (asumsi tanpa rata-rata sektor)
  // ----------------------------
  if (Value > 5_000_000) volumeScore += 5;
  if (Frequency > 1000) volumeScore += 5;

  // ----------------------------
  // 5. RISK SCORE (0–20)
  // ----------------------------
  if (BetaOneYear < 0.7) riskScore += 8;
  if (StdevOneYear < 0.35) riskScore += 6;

  // Harga dekat yearly low (opsional jika data tersedia)
  // if (Last <= AnnualLow * 1.10) riskScore += 6;

  // ----------------------------
  // TOTAL SCORE
  // ----------------------------
  const score =
    trendScore +
    momentumScore +
    valuationScore +
    volumeScore +
    riskScore;

  // ----------------------------
  // LABEL
  // ----------------------------
  let label = "HOLD";
  if (score >= 85) label = "STRONG BUY";
  else if (score >= 70) label = "BUY";
  else if (score >= 55) label = "WATCHLIST";
  else if (score >= 40) label = "HOLD";
  else label = "AVOID";

  return {
    score,
    label,

    // breakdown detail
    trendScore,
    momentumScore,
    valuationScore,
    volumeScore,
    riskScore,
  };
}
