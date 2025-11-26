Untuk **swing trader**, filter saham **TOP Gainer > 5%** dan **harga di bawah 1000** sudah sangat bagus karena:

✔ volatilitas cukup tinggi → peluang profit
✔ harga rendah → ruang kenaikan lebih besar
⚠ tetapi harus dibatasi dengan filter fundamental & volume agar tidak masuk “saham gorengan berbahaya”

---

## 🎯 **Rekomendasi Screener Swing Trader (versi optimal)**

Gunakan **kondisi berikut** di screener AI kamu:

| Kategori                     | Filter                                                 |
| ---------------------------- | ------------------------------------------------------ |
| Harga                        | **< 1000**                                             |
| Persentase kenaikan hari ini | **> +5% (Top Gainer)**                                 |
| Volume                       | **> 5.000.000 (5 juta)**                               |
| Nilai transaksi              | **> 5 miliar**                                         |
| Volatilitas                  | **ATR 14 > 3%**                                        |
| Tren 1 minggu                | **> +2%**                                              |
| PER                          | **< 20 (opsional, untuk cari yang fundamental bagus)** |
| ROE                          | **> 8% (opsional)**                                    |
| Status AI                    | **BUY / WATCHLIST**                                    |

---

## 🧠 **Logika AI Signal untuk swing trader**

Berikan sinyal berdasarkan 3 indikator utama:

```txt
BUY → Volume besar + Uptrend satu minggu + Break resistance
WATCHLIST → Mulai meningkat tapi volume belum confirm
HOLD → Sudah naik tinggi dan momentum melemah
CUT LOSS → Breakdown support atau volume anjlok
```

---

## 💡 Formula AI Score (Swing Trading Model)

Kamu bisa gunakan pembobotan seperti ini:

| Parameter               | Bobot |
| ----------------------- | ----- |
| Price Momentum          | 40%   |
| Volume / Value          | 25%   |
| Trend 1 Week            | 15%   |
| Trend 1 Month           | 10%   |
| Fundamental (ROE & PER) | 10%   |

➡ **Score 75–100 = BUY**
➡ **Score 55–74 = WATCHLIST**
➡ **Score < 55 = AVOID / CUT LOSS**

---

## 🧩 Contoh Query Filtering (pseudo-code)

Kalau di Next.js:

```js
const results = stocks
  .filter(s => s.Last < 1000)
  .filter(s => s.OneDay > 0.05)
  .filter(s => s.Volume > 5000000)
  .filter(s => s.Value > 5000000000)
  .map(s => ({ ...s, ai: scoreSwing(s) }));
```

---

## 🔥 Bonus — indikator chart untuk entry swing

Gunakan checklist **entry candle**:

✔ Breakout dari resistance
✔ Volume > 150% rata-rata 20 hari (VMA20)
✔ RSI 50–65 (belum terlalu overbought)

⛔ Jangan entry jika:

❌ RSI > 75
❌ Kenaikan >15% dalam 1 hari (rawan distribusi)
❌ Volume menipis setelah lonjakan harga

---

## 🎁 Hasilnya nanti di UI

Status yang muncul untuk **Swing Trader**:

| Sinyal     | Arti                          |
| ---------- | ----------------------------- |
| STRONG BUY | Momentum kuat, masuk cepat    |
| BUY        | Momentum oke, valid           |
| WATCHLIST  | Tunggu volume / breakout      |
| HOLD       | Sudah naik terlalu tinggi     |
| AVOID      | Momentum lemah, risiko tinggi |

---

Kalau kamu mau, saya bisa lanjutkan:

🔹 Buat **AI Score Swing Trading** di Next.js
🔹 Buat **Page Filter “Top Gainer Swing Trader < 1000”**
🔹 Buat **chart dengan garis support & resistance otomatis**
🔹 Buat **alert via Telegram / WA kalau muncul BUY**

Siap lanjut ke implementasi kode halaman Next.js? 🚀
