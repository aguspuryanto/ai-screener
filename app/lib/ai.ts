/*
Struktur Data API Pasardana:
    ✔ Harga & OHLC
    Last
    PrevClosingPrice
    AdjustedOpenPrice
    AdjustedHighPrice
    AdjustedLowPrice

    ✔ Volume & Nilai
    Volume
    Frequency
    Value

    ✔ Return Periodik
    OneDay, OneWeek, OneMonth
    ThreeMonth, SixMonth, OneYear
    Mtd, Ytd

    ✔ Valuasi
    Per
    Pbr
    PsrAnnualized
    PcfrAnnualized

    ✔ Risiko
    BetaOneYear
    StdevOneYear

    ✔ Fundamental
    Roe
    Capitalization

AI Screener Model — 5 Faktor Utama
    Faktor 1 — Trend Score (0–20)
    Menggunakan return periodik:
    | Kondisi           | Score |
    | ----------------- | ----- |
    | 1 hari > 0        | +3    |
    | 1 minggu > 0      | +4    |
    | 1 bulan > 0       | +5    |
    | 3 bulan > 0       | +5    |
    | Harga > PrevClose | +3    |

    Faktor 2 — Momentum Score (0–20)
    - Return 1 bulan positif + return 3 bulan positif → momentum kuat
    - Beta kecil → stabil tetapi tidak agresif
    - Volatilitas sedang → momentum sehat
    | Kondisi             | Score          |
    | ------------------- | -------------- |
    | OneMonth > 5%       | +8             |
    | ThreeMonth > 10%    | +10            |
    | StdevOneYear < 0.40 | +4             |
    | BetaOneYear 0.8–1.2 | +3             |
    | BetaOneYear < 0.6   | +1 (defensive) |

    Faktor 3 — Valuation Score (0–20)
    Semakin murah semakin bagus
    | Kondisi    | Score |
    | ---------- | ----- |
    | PER < 8    | +8    |
    | PER 8–12   | +6    |
    | PBV < 1    | +6    |
    | PSR rendah | +4    |
    | ROE > 10%  | +4    |

    Faktor 4 — Volume & Demand Score (0–20)
    Volume tinggi menandakan minat BUY meningkat
    | Kondisi                                          | Score |
    | ------------------------------------------------ | ----- |
    | Volume > nilai rata-rata sektor (jika diketahui) | +10   |
    | Value > 5 M                                      | +5    |
    | Frequency > 1000                                 | +5    |

    Faktor 5 — Risk Score (0–20)
    Risiko rendah = lebih stabil, risiko tinggi = potensi besar tapi berbahaya
    | Kondisi                | Score |
    | ---------------------- | ----- |
    | Beta < 0.7             | +8    |
    | StdevOneYear < 0.35    | +6    |
    | Harga dekat annual low | +6    |

    Total Score = 100
    | Score  | Status         |
    | ------ | -------------- |
    | 85–100 | **STRONG BUY** |
    | 70–84  | **BUY**        |
    | 55–69  | **WATCHLIST**  |
    | 40–54  | **HOLD**       |
    | <40    | **AVOID**      |
*/

export function scoreStock(stock: any) {
  const { Per, Pbr, Roe, OneMonth, SixMonth } = stock;

  // Default score
  let score = 0;

  // Valuation
  if (Per !== null && Per < 10) score += 20;
  if (Pbr !== null && Pbr < 1) score += 20;

  // Profitability
  if (Roe !== null && Roe > 0.15) score += 25;

  // Momentum
  if (OneMonth !== null && OneMonth > 0) score += 15;
  if (SixMonth !== null && SixMonth > 0.1) score += 20;

  // Final label
  let label = "HOLD";
  if (score >= 70) label = "BUY";
  else if (score <= 40) label = "CUT LOSS";

  return { score, label };
}
