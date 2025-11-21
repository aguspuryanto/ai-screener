/*
 * Stockbit Screener
 1. QUALITY SCREEN (Fundamental Kuat)
    Tujuan: cari perusahaan yang sehat & efisien.
    Kriteria:
    ROE > 15%
    ROA > 8%
    GPM > 20%
    NPM > 10%
    DER < 1.0

    Contoh Pseudo-code:
    stock.ROE > 0.15 &&
    stock.ROA > 0.08 &&
    stock.NPM > 0.10 &&
    stock.DER < 1

    2. VALUE SCREEN (Murah Secara Valuasi)
    Dipakai untuk mencari saham undervalued ala “Value Investing”.
    Kriteria:
    PER < 12
    PBV < 1.5
    PEG < 1 (jika tersedia)
    EV/EBIT < 10

    3. GROWTH SCREEN (Perusahaan Bertumbuh)
    Dipakai untuk cari saham “Growth”.
    Kriteria:
    EPS Growth YoY > 10%
    Revenue Growth YoY > 10%
    Net Income Growth > 10%
    Code:
    stock.epsGrowth > 0.10 &&
    stock.revenueGrowth > 0.10 &&
    stock.netIncomeGrowth > 0.10

    4. MOMENTUM SCREEN (Trend Kuat)
    Dipakai swing trader Stockbit.
    Kriteria:
    1-month return > 5%
    3-month return > 10%
    Harga > MA20
    Harga > MA50

    5. RISK SCREEN (Risiko Rendah)
    Dipakai investor konservatif.
    Kriteria:
    Beta 1 year < 1.0
    Stdev 1 year < 0.35
    Debt/Equity < 1.0

    6. LIQUIDITY SCREEN (Saham Likuid)
    Supaya mudah ditradingkan.
    Kriteria:
    Average Daily Volume > 2 juta
    Average Daily Value > 10 miliar
 */

// export function stockbitScreener(stock: any) {
//   const results = {
//     quality: false,
//     value: false,
//     growth: false,
//     momentum: false,
//     risk: false,
//     liquidity: false
//   };

//   // QUALITY
//   if (
//     stock.ROE > 0.15 &&
//     stock.ROA > 0.08 &&
//     stock.NPM > 0.10 &&
//     stock.DER < 1
//   ) results.quality = true;

//   // VALUE
//   if (
//     stock.PER > 0 &&
//     stock.PER < 12 &&
//     stock.PBV < 1.5
//   ) results.value = true;

//   // GROWTH
//   if (
//     stock.EPSGrowth > 0.10 &&
//     stock.RevenueGrowth > 0.10 &&
//     stock.NetProfitGrowth > 0.10
//   ) results.growth = true;

//   // MOMENTUM
//   if (
//     stock.OneMonth > 0.05 &&
//     stock.ThreeMonth > 0.10
//   ) results.momentum = true;

//   // RISK
//   if (
//     stock.BetaOneYear < 1 &&
//     stock.StdevOneYear < 0.35
//   ) results.risk = true;

//   // LIQUIDITY
//   if (
//     stock.AvgVolume > 2000000 &&
//     stock.AvgValue > 10000000000
//   ) results.liquidity = true;

//   // FINAL DECISION
//   const totalPass = Object.values(results).filter(v => v).length;

//   let label = "AVOID";
//   if (totalPass >= 4) label = "STRONG BUY";
//   else if (totalPass === 3) label = "BUY";
//   else if (totalPass === 2) label = "WATCHLIST";
//   else label = "AVOID";

//   return { ...results, label };
// }
export function stockbitScreener(stock: any) {
  const results = {
    quality: false,
    value: false,
    growth: false,
    momentum: false,
    risk: false,
    liquidity: false
  };

  // QUALITY
  if (
    stock.Roe > 0.15 &&
    stock.ROA > 0.08 &&
    stock.NPM > 0.10 &&
    stock.DER < 1
  ) results.quality = true;

  // VALUE
  if (
    stock.Per > 0 &&
    stock.Per < 12 &&
    stock.Pbr < 1.5
  ) results.value = true;

  // GROWTH
  if (
    stock.EPSGrowth > 0.10 &&
    stock.RevenueGrowth > 0.10 &&
    stock.NetProfitGrowth > 0.10
  ) results.growth = true;

  // MOMENTUM
  if (
    stock.OneMonth > 0.05 &&
    stock.ThreeMonth > 0.10
  ) results.momentum = true;

  // RISK
  if (
    stock.OneYear < 1 &&
    stock.StdevOneYear < 0.35
  ) results.risk = true;

  // LIQUIDITY
  if (
    stock.Volume > 2000000 &&
    stock.Value > 10000000000
  ) results.liquidity = true;

  const totalPass = Object.values(results).filter(Boolean).length;

  let label = "AVOID";
  if (totalPass >= 5) label = "STRONG BUY";
  else if (totalPass == 4) label = "BUY";
  else if (totalPass == 3) label = "WATCHLIST";
  else label = "AVOID";

  return { ...results, totalPass, label };
}
