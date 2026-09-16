# Panduan Upload Kategori & Produk — Joglo Print

Referensi cepat untuk agent yang membantu Joe mengisi data kategori/produk/foto. Baca file ini SEBELUM mulai input data baru. Untuk aturan arsitektur/kode, tetap rujuk `CLAUDE.md`.

---

## 1. Alur Kerja Standar (urutan wajib)

```
1. Tentukan/pilih Kategori dulu → pilih pricing_engine yang tepat (lihat #2)
2. Buat Produk di kategori itu
3. Isi Spesifikasi (array label-value bebas)
4. Buat Varian + Tier Harga (lihat #3)
5. Buat Add-on kalau ada (lihat #4)
6. Upload Foto (lihat #5 — hash SHA-256 otomatis, cek peringatan duplikat)
7. Preview via tombol "Lihat di Halaman Publik" sebelum dianggap selesai
8. Commit git per kategori selesai (bukan per produk), ikuti GIT_PROTOCOL_JOGLOWEB.md
```

## 2. Memilih Pricing Engine per Kategori

| Engine       | Dipakai kalau...                             | Satuan     | Contoh kategori sudah ada         |
| ------------ | -------------------------------------------- | ---------- | --------------------------------- |
| `sheet`      | Dihitung per lembar/pcs diskrit              | lembar/pcs | Stiker & Label, Digital Print A3+ |
| `bundle`     | Dihitung per buku/rim/paket                  | buku/rim   | Nota, Yasin (rencana)             |
| `area`       | Dihitung dari 2 dimensi (panjang×lebar cm)   | m²         | Banner/MMT, Indoor Poster         |
| `meter_lari` | Dihitung dari 1 dimensi (panjang meter saja) | meter      | Spanduk Kain & Textile            |

**Aturan:** 1 kategori = 1 engine, konsisten untuk semua produk di dalamnya. Kalau 1 lini bisnis punya 2 cara hitung berbeda (mis. DTF kaos per-pcs vs DTF roll per-meter), itu 2 KATEGORI terpisah, bukan 1 kategori campur engine.

## 3. Varian & Tier Harga

- Nama varian BEBAS (bukan dropdown tetap) — isi sesuai realita produk (Finishing untuk sheet, Lebar bahan untuk meter_lari, dst).
- Tiap varian minimal 1 baris tier (`min_qty`, `max_qty`, `price_per_unit`). `max_qty` kosong/null = "ke atas" (tier tertinggi).
- **Makna `price_per_unit` beda per engine** (lihat tabel #2) — SELALU cek `pricing_model` produk induk sebelum menafsirkan angka.
- Untuk `meter_lari`: panjang (meter) berperan sama seperti qty di `sheet` — reuse mesin tier yang sama, tidak ada fungsi kalkulasi terpisah.
- Untuk `area`: addon dihitung **per m²** (proporsional ke luas), BEDA dari engine lain yang addon-nya flat per pcs.

## 4. Add-on

- Nama bebas, harga flat per unit (kecuali engine `area`, lihat #3).
- Tandai 1 add-on sebagai default (biasanya "Tanpa Tambahan" / Rp0).
- Kalau harga belum pasti, isi `Rp 0` DAN tulis di description: `"BELUM FINAL - harga asli menyusul dari Joe"` — JANGAN karang angka.

## 5. Upload Foto

- Lewat admin panel (Server Action, Cloudinary, folder `joglo-print/`).
- Hash SHA-256 dihitung otomatis sebelum upload — kalau ada foto sama persis sudah dipakai produk lain, muncul peringatan (bukan blocking, tapi cek dulu sebelum lanjut).
- Tandai 1 foto sebagai primary (thumbnail kartu produk).
- Foto belum ada? Boleh skip dulu — TIDAK boleh generate/pakai foto AI/placeholder seolah produk asli.

## 6. Data yang HARUS Nyata (larangan keras)

- Harga, spesifikasi teknis, nama produk: harus dari Joe atau referensi nyata (pricelist supplier, dsb) — bukan karangan/tebakan agent.
- Kalau data belum ada: placeholder eksplisit ("BELUM FINAL"), jangan diam-diam diisi angka masuk akal.
- Deskripsi produk: idem — SEO butuh deskripsi asli, bukan generik yang dipaksakan.

## 7. Status & Visibility

- `is_active = false` untuk produk yang belum siap tampil publik (draft) — pakai quick-toggle di tabel admin, bukan hapus.
- Kategori kosong (0 produk aktif) otomatis tidak muncul di Home — normal, bukan bug.

## 8. Setelah Selesai 1 Kategori

- Jalankan `npm test` dan `npm run build` — pastikan tidak ada yang patah.
- Commit git per kategori (GIT_PROTOCOL_JOGLOWEB.md, Checkpoint 1-4, HALT tetap wajib).
- Kalau ketemu pola harga yang TIDAK cocok dengan 4 engine di atas — STOP, jangan improvisasi skema baru sendiri. Itu butuh keputusan arsitektur di sesi utama (lihat riwayat kasus lebar kain & area+addon di IMPLEMENTATION_PLAN_JOGLOPRINT.md sebagai contoh kenapa ini penting).
