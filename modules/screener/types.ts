// --- Types ---
export type ScoreDetails = {
  trend: number;
  momentum: number;
  volume: number;
  breakout: number;
  risk: number;
  total: number;
  status: string;
};

export type Indicators = {
  rsi: number;
  macd: number;
  ma20: number;
  atr_pct: number;
  volume_ratio: number;
};

export type StockData = {
  Code: string;
  Name: string;
  Last: number;
  OneDay: number;
  Per?: number;
  Pbr?: number;
  Roe?: number;
  ai: { score: number; label: string };
  scores: ScoreDetails;
  indicators: Indicators;

  // "Id": 110,
  // "Name": "Garuda Metalindo Tbk.",
  // "Code": "BOLT",
  // "StockSubSectorId": 36,
  // "SubSectorName": "Automotive & Components",
  // "StockSectorId": 9,
  // "SectorName": "MISCELLANEOUS INDUSTRY",
  // "NewSubIndustryId": 51,
  // "NewSubIndustryName": "Suku Cadang Otomotif",
  // "NewIndustryId": 26,
  // "NewIndustryName": "Komponen Otomotif",
  // "NewSubSectorId": 11,
  // "NewSubSectorName": "Otomotif & Komponen Otomotif",
  // "NewSectorId": 5,
  // "NewSectorName": "Barang Konsumen Non-Primer",
  // "Last": 1095,
  // "PrevClosingPrice": 1115,
  // "AdjustedClosingPrice": 1095,
  // "AdjustedOpenPrice": 1115,
  // "AdjustedHighPrice": 1115,
  // "AdjustedLowPrice": 1095,
  // "Volume": 16400,
  // "Frequency": 7,
  // "Value": 18073500,
  // "OneDay": -0.01793722,
  // "OneWeek": -0.01793722,
  // "OneMonth": 0.04784689,
  // "ThreeMonth": 0.02816901,
  // "SixMonth": -0.06410256,
  // "OneYear": -0.02232143,
  // "ThreeYear": 0.40384615,
  // "FiveYear": 0.99090909,
  // "TenYear": 0.07881773,
  // "Mtd": -0.04782609,
  // "Ytd": -0.15769231,
  // "Per": 18.8261,
  // "Pbr": 2.68326,
  // "Capitalization": 2566406250000,
  // "BetaOneYear": 0.09124162,
  // "StdevOneYear": 0.23187262,
  // "PerAnnualized": 17.86211,
  // "PsrAnnualized": 1.53037,
  // "PcfrAnnualized": 10.62026,
  // "AdjustedAnnualHighPrice": 1430,
  // "AdjustedAnnualLowPrice": 1040,
  // "LastDate": "2025-11-19T00:00:00",
  // "LastUpdate": "2025-11-19T00:00:00",
  // "Roe": 0.150220575384317
};