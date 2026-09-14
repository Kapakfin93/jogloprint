# Implementation Plan: Website Joglo Print — Pilot Kategori Stiker & Label

## Overview

Membangun website katalog Joglo Print (Home → Kategori → Produk) + admin dashboard CRUD, database Supabase terpisah, deploy Vercel. Desain visual sudah final di Google Stitch (3 halaman: Home, Kategori Stiker & Label, Detail Produk Stiker Kromo A3+) — dipakai sebagai referensi visual, bukan sumber kode literal. Scope pilot: 1 kategori penuh (Stiker & Label) untuk membuktikan alur admin → database → frontend, sebelum direplikasi ke kategori lain.

## Architecture Decisions

- **Monorepo Next.js (App Router)**, publik + admin dalam 1 codebase.
- **Supabase project baru**, terpisah total dari KasirGrafity.
- **URL flat** (`/produk/{slug}`, bukan nested di bawah kategori) — supaya produk bisa pindah kategori tanpa merusak SEO.
- **Finishing = varian bertingkat harga** (`product_variants` + `variant_price_tiers`); **Laminasi = add-on flat** (`product_addons`) — bukan varian penuh, supaya data entry admin ringan.
- **Cloudinary** untuk foto (bukan Supabase Storage).
- **Tanpa cart/checkout** — CTA "Pesan via WhatsApp" generate teks terstruktur berlabel tetap (Produk/Finishing/Laminasi/Jumlah/Harga/Link), disiapkan supaya kompatibel di-parsing bot WA di masa depan.
- **Layout "dikunci" di kode** (hasil Stitch) — admin panel hanya CRUD data (teks, harga, foto), bukan page builder.
- Skema disiapkan agar mudah ditambah tabel `orders` nanti (ekstensi masa depan untuk bot agentic) — tidak dibangun sekarang (YAGNI).

### Addendum: Multi-Engine Pricing (diputuskan setelah audit arsitektur, menyusul Task 6)

Ditemukan kebutuhan nyata: tidak semua kategori Joglo Print dihitung per-lembar (stiker). Banner dihitung per m², Spanduk Kain per meter lari. Keputusan setelah audit:

- **4 engine**: `sheet` (lembar/pcs, default), `bundle` (buku/rim), `area` (m², dihitung dari panjang×lebar cm), `meter_lari` (per meter panjang).
- **Engine adalah properti Kategori** (`categories.pricing_engine`), cascade otomatis ke `products.pricing_model` & `unit_label` via DB trigger saat kategori diedit.
- **`sheet`/`bundle`** tetap 100% pakai mekanisme `product_variants`+`variant_price_tiers` yang sudah ada sejak awal (tidak ada perubahan). Add-on dihitung flat per-pcs/buku: `(unitPrice + addonFlat) * qty`.
- **`area`**: dihitung dari 2 dimensi (panjang×lebar cm) via `calculateAreaPrice()`, pure function terpisah di `pricing.service.ts`. Minimal order pakai `products.min_order_qty` (di-rename dari `min_order_area`). Add-on dihitung proporsional terhadap luas bahan terpakai (`billedAreaM2`), yaitu `billedAreaM2 * (pricePerM2 + addonFlat) * qty`.
- **`meter_lari`**: dihitung dari 1 dimensi (panjang meter) via `calculateMeterLariPrice()`, pure function terpisah. **Lebar bahan TIDAK mempengaruhi harga** — cuma info di `specifications` (dikonfirmasi Joe, mengacu pricelist supplier: harga/meter sama untuk semua pilihan lebar). Varian (`product_variants`) untuk kategori ini tetap dipakai untuk axis Finishing (mis. "Obras + Tali Samping"), bukan lebar. Add-on dihitung flat per-meter: `(unitPrice + addonFlat) * lengthM`.
- **Kolom `variant_price_tiers.price_per_unit` reinterpretasi kontekstual** sesuai `pricing_model` produk induknya (Rp/lembar, Rp/m², atau Rp/meter) — didokumentasikan via `COMMENT ON COLUMN` di database, WAJIB selalu join ke `products.pricing_model` sebelum menafsirkan nilai ini di query manapun.
- **Kolom `product_addons.price_flat` reinterpretasi kontekstual** sesuai `pricing_model` produk induknya: untuk engine `area` bermakna Rp/m² (dikalikan `billedAreaM2` karena laminasi/bahan tambahan proporsional ke luas); untuk `sheet`/`bundle`/`meter_lari` bermakna flat nominal per satuan. Didokumentasikan via `COMMENT ON COLUMN public.product_addons.price_flat` di database.

## Task List

### Phase 1: Foundation

- [x] **Task 1 — Setup Supabase project + schema.** Buat project Supabase baru. Buat tabel: `categories`, `products`, `product_variants`, `variant_price_tiers`, `product_addons`, `product_images`, `business_info`. Aktifkan RLS: publik read-only, write hanya service role/owner.
  - Acceptance: semua tabel dibuat, RLS policy publik READ berhasil, WRITE dari anon key ditolak. (VERIFIED)
  - Verification: test manual via Supabase SQL editor + coba insert pakai anon key (harus gagal). (VERIFIED)
  - Dependencies: None. Scope: S.

- [x] **Task 2 — Setup Next.js repo skeleton.** Init project Next.js App Router + Tailwind, koneksi ke Supabase (client & server helper di `lib/supabase/`), koneksi Cloudinary (upload helper), deploy kosong pertama ke Vercel.
  - Acceptance: `npm run dev` jalan, halaman kosong ter-deploy ke Vercel URL sementara, env var Supabase & Cloudinary terbaca. (VERIFIED)
  - Verification: `npm run build` sukses; buka URL Vercel, tidak error. (VERIFIED)
  - Dependencies: Task 1. Scope: S.

### Checkpoint: Foundation

- [x] Supabase & Next.js saling terhubung (test query dummy berhasil) (VERIFIED)
- [x] Deploy pipeline Vercel jalan otomatis dari git push (VERIFIED)

### Phase 2: Core Features (Vertical Slice — Kategori Stiker & Label)

- [x] **Task 3 — Admin: CRUD Kategori.** Halaman `/admin/kategori` (list + form tambah/edit). Auth guard Supabase Auth (1 akun owner).
  - Acceptance: admin bisa login, tambah kategori "Stiker & Label" dengan slug auto-generate, muncul di list. (VERIFIED)
  - Verification: manual — buat 1 kategori, cek tersimpan di Supabase. (VERIFIED)
  - Dependencies: Task 2. Scope: M.

- [x] **Task 4 — Admin: CRUD Produk + Foto (Cloudinary).** Halaman `/admin/produk` — form nama, kategori, deskripsi, spesifikasi (markdown), upload foto multi ke Cloudinary.
  - Acceptance: admin bisa tambah produk "Stiker Kromo A3+" dengan minimal 1 foto ter-upload. (VERIFIED)
  - Verification: manual — cek foto muncul di Cloudinary dashboard & URL tersimpan di `product_images`. (VERIFIED)
  - Dependencies: Task 3. Scope: M.

- [x] **Task 5 — Admin: CRUD Varian (Finishing) + Tier Harga.** Halaman `/admin/produk/[id]/varian` — tambah/hapus varian dengan NAMA BEBAS (bukan pilihan tetap/dropdown fixed) karena tiap lini produk punya pola finishing berbeda: Stiker (Kiss Cut/Die Cut/Tanpa Potong), Banner (Rangka+Mata Ayam/Tanpa Rangka), Sablon DTF (1 Sisi/2 Sisi), Nota (1 Ply/2 Ply/3 Ply), dst. Tiap varian punya tabel tier qty×harga sendiri (tambah/hapus baris), pola sama seperti `ProductSpecificationEditor` di Task 4 (dinamis, generik, reusable lintas kategori).
  - Acceptance: minimal 1 produk pilot ("Stiker Kromo A3+") punya 3 varian dengan nama sesuai data nyata, masing-masing minimal 4 baris tier harga. UI TIDAK mengandung nama varian ter-hardcode di kode (mis. tidak ada `enum`/dropdown tetap berisi "Kiss Cut"). (VERIFIED)
  - Verification: manual — input data dummy dengan nama varian custom di luar contoh stiker (mis. coba tambah varian "Test Custom Finishing"), cek tersimpan benar di `variant_price_tiers` tanpa error. (VERIFIED)
  - Dependencies: Task 4. Scope: M.

- [x] **Task 6 — Admin: CRUD Add-on (Laminasi).** Halaman `/admin/produk/[id]/addon` — tambah add-on (nama + harga tambahan flat).
  - Acceptance: 1 produk punya 3 add-on (Tanpa/Glossy/Doff) dengan harga tambahan masing-masing. (VERIFIED)
  - Verification: manual cek tabel `product_addons`. (VERIFIED)
  - Dependencies: Task 4. Scope: S.

- [x] **Task 7 — Halaman publik: Home.** Implementasi sesuai desain Stitch (revisi per-kategori section). Query kategori yang punya produk + 3-4 produk preview per kategori.
  - Acceptance: kategori tanpa produk tidak muncul; kategori dengan produk tampil dengan preview benar. (VERIFIED)
  - Verification: manual — matikan sementara 1 produk, cek section kategori ikut hilang kalau produk kosong. (VERIFIED)
  - Dependencies: Task 5, 6 (butuh data nyata untuk uji). Scope: M.

- [x] **Task 8 — Halaman publik: Kategori.** Implementasi `/kategori/[slug]` sesuai desain Stitch — grid semua produk dalam kategori.
  - Acceptance: halaman `/kategori/stiker-label` menampilkan seluruh produk yang diinput admin. (VERIFIED)
  - Verification: manual cross-check jumlah produk di admin vs yang tampil. (VERIFIED)
  - Dependencies: Task 5, 6. Scope: S.

- [x] **Task 9a — Detail Produk: layout statis + pemilih Finishing.** Implementasi `/produk/[slug]` — galeri foto (thumbnail+gallery Cloudinary), nama, deskripsi, render `specifications` (array label/value, 2 kolom sesuai desain Stitch), pemilih varian Finishing (dinamis dari `product_variants`, default = varian `is_default=true`), tabel tier harga varian yang sedang dipilih (update saat varian diganti).
  - Acceptance: ganti pilihan Finishing → tabel tier harga di bawahnya berubah sesuai varian yang dipilih (belum ada kalkulasi qty/addon di tahap ini). (VERIFIED)
  - Dependencies: Task 5. Scope: M.

- [x] **Task 9b — Detail Produk: pemilih Add-on.** Tambahkan pemilih Laminasi (dinamis dari `product_addons`, default = addon `is_default=true`), tampilkan harga tambahan tiap opsi.
  - Acceptance: ganti pilihan add-on mengubah tampilan biaya tambahan yang akan dipakai di kalkulasi Task 9c. (VERIFIED)
  - Dependencies: Task 6, 9a. Scope: S.

- [x] **Task 9c — Detail Produk: input qty + kalkulasi total harga live.** Input jumlah pesanan (qty), panggil `findApplicableTier()` dari `pricing.service.ts` untuk cari tier sesuai qty pada varian terpilih, lalu `calculateTotalPrice()` untuk total akhir (tier+addon)×qty. WAJIB reuse fungsi dari pricing.service.ts, TIDAK boleh menulis ulang logic kalkulasi di komponen.
  - Acceptance: perubahan qty/finishing/addon menghasilkan total harga yang benar secara matematis, diverifikasi manual minimal 4 kombinasi berbeda (dicatat di laporan: input → hasil tampilan → hasil hitung manual, harus sama persis). (VERIFIED)
  - Verification: manual — 4 kombinasi (mis. Kiss Cut+Tanpa Laminasi qty 5; Kiss Cut+Glossy qty 50; Die Cut+Doff qty 120; Tanpa Potong+Tanpa Laminasi qty 1). (VERIFIED)
  - Dependencies: Task 9b. Scope: M.

- [x] **Task 10 — CTA WhatsApp terstruktur.** Komponen `WhatsAppCTA` generate teks pre-filled (label tetap) dari state pilihan + `business_info.whatsapp_number`, buka `wa.me`.
  - Acceptance: klik CTA membuka WA dengan teks sesuai template yang sudah disepakati, termasuk link produk. (VERIFIED)
  - Verification: manual — klik, cek teks di WA terbuka sesuai format. (VERIFIED)
  - Dependencies: Task 9. Scope: S.

### Checkpoint: Core Features

- [x] Alur end-to-end jalan: admin input produk baru → langsung muncul di Home, Kategori, dan Detail Produk → klik pesan → WA terbuka dengan teks benar (VERIFIED)
- [x] Review bareng Joe sebelum lanjut ke Phase 3 (VERIFIED)

### Phase 3: Polish & SEO

- [x] **Task 11 — Admin: form Info Bisnis.** Halaman `/admin/info-bisnis` — alamat, jam buka per hari (bukan "24 jam"), nomor WA, area pengiriman.
  - Acceptance: data ini dipakai otomatis di footer semua halaman + JSON-LD. (VERIFIED)
  - Dependencies: Task 2. Scope: S.

- [x] **Task 12 — SEO: JSON-LD & meta tags.** Pasang `LocalBusiness` / `PrintingService` schema di `app/layout.tsx`, `Product` & `Offer` schema di `app/produk/[slug]`, serta `BreadcrumbList` schema pada kategori & produk via `components/seo/JsonLd.tsx`. Title & meta description dibuat dinamis via `generateMetadata` dengan format localized Demak, canonical URL, dan OpenGraph. (VERIFIED)
  - Acceptance: Tag `<title>`, `<meta name="description">`, canonical URL, dan script JSON-LD ter-render valid pada response HTML halaman publik. (VERIFIED)
  - Verification: Test live endpoint via `scratch/test_seo_tags.js` — terverifikasi 200 OK pada halaman kategori & produk. (VERIFIED)
  - Dependencies: Task 7, 8, 9, 11. Scope: M.

- [x] **Task 13 — Sitemap & robots.txt.** `app/sitemap.ts` auto-generate dinamis dari database Supabase (`lib/repositories/seo.repository.ts`), serta `app/robots.ts` memproteksi rute `/admin/` dan menautkan sitemap. (VERIFIED)
  - Acceptance: `/sitemap.xml` berisi seluruh URL kategori & produk aktif dengan timestamp `lastmod` dan priority; `/robots.txt` valid memblokir crawler ke admin. (VERIFIED)
  - Verification: Request langsung ke `http://localhost:3000/sitemap.xml` dan `/robots.txt` berhasil (HTTP 200 OK). (VERIFIED)
  - Dependencies: Task 7, 8, 9. Scope: XS.

### Checkpoint: Complete (Pilot Kategori Stiker & Label)

- [x] Semua acceptance criteria Task 1-13 terpenuhi (Task 12 & 13 selesai & terverifikasi) (VERIFIED)
- [ ] Domain final dibeli & disambungkan (kalau sudah diputuskan)
- [x] Siap direplikasi ke kategori Wave 1 lainnya (tinggal input data lewat admin, tanpa kode baru) (VERIFIED)

## Wave 1 — Perluasan di Luar Rencana Awal

Dokumentasi fitur dan katalog yang diputuskan langsung oleh Joe dalam iterasi Wave 1 di luar rencana awal:

1. **Tabel & Manajemen `home_banners` (`/admin/banners`)**:
   - **Tujuan:** Mengelola slider promo dinamis di Home Hero (mengadopsi referensi layout AnugerahPrint).
   - **Kolom Utama:** `id`, `title`, `subtitle`, `image_url`, `link_url`, `display_order`, `is_active`, `created_at`.
   - **RLS Policy:** Publik `SELECT` (hanya banner yang `is_active = true`), Write/CRUD hanya untuk admin terautentikasi (`admin_users`).

2. **Panduan Visual Admin & Protokol Input (`/admin/panduan` & `GUIDE_CATALOG_INPUT_PROTOCOL.md`)**:
   - **Tujuan:** Standarisasi visual dan SOP format pengisian katalog bagi admin/operator (perbedaan pengisian stiker, spanduk meteran, nota ply, sablon DTF, buku yasin, dsb.) langsung di dashboard tanpa perlu membuka file markdown teknis.

3. **Kategori "Lanyard & ID Card" (`lanyard-id-card`)**:
   - **Produk Baru:** `id-card-pvc-custom` (ID Card PVC Custom).
   - **Spesifikasi:** Bahan PVC, ukuran standar 54 × 86 mm, print full color, order kelipatan (step) 5 pcs, min order 25 pcs.
   - **Struktur Harga Tiering:**
     - Varian 1 Muka: Tier min 25 pcs = Rp 8.000, Tier grosir (> 25 pcs) = Rp 5.000.
     - Varian 2 Muka: Tier min 25 pcs = Rp 9.000, Tier grosir (> 25 pcs) = Rp 6.000.
     - Add-on: Tanpa Tali/Lobang (Rp 0), Tambah Tali Lanyard (+Rp 5.000).

## Pre-Launch Checklist (cek sebelum situs live publik / repo private)

- [ ] Verifikasi semua gambar produk/kategori pakai komponen `<Image />` Next.js (bukan `<img>` biasa) — auto WebP/AVIF + resize, penting untuk skor Core Web Vitals (LCP).
- [x] Task 12 & 13 selesai (metadata dinamis, Schema.org JSON-LD, sitemap dinamis & robots.txt) — SELESAI & TERVERIFIKASI. (VERIFIED)
- [ ] Repo GitHub diubah ke Private (lihat "Catatan Repo").
- [ ] Domain final dibeli & disambungkan.

## Backlog Keamanan (optional, bukan blocker launch)

- **Cloudflare Turnstile + WAF untuk halaman admin**: berguna kalau nanti ada indikasi serangan/brute-force nyata. Belum perlu sekarang (1 admin, RLS+Auth sudah diaudit ketat). Revisit kalau ada sinyal ancaman nyata.
- **TIDAK diadopsi**: menyembunyikan URL admin (`/admin` → path acak) — ini security-through-obscurity, bukan proteksi nyata. Proteksi sesungguhnya sudah ada lewat Supabase Auth + `admin_users` + RLS yang sudah diaudit tuntas.

## Catatan Repo

- Repo GitHub (`Kapakfin93/jogloprint`) sengaja **PUBLIC** untuk sementara (fase pre-build/audit), supaya bisa diverifikasi langsung tanpa akses MCP. **WAJIB diubah ke Private sebelum Task 12-13** (SEO/go-live) — jangan lupa cek ini sebelum publikasi resmi.

## Backlog (belum prioritas, dicatat supaya tidak hilang)

- **SKU auto-generate**: saat ini manual/NULL, belum ada generator otomatis. Tidak urgent — kolom `sku` belum dipakai logic manapun (barcode/integrasi fisik belum ada).
- **Uji nyata parallel deletion**: klaim "aman via ACID transaction" masih argumen teoretis, belum dibuktikan dengan tes 2 tab admin bersamaan. Risiko rendah untuk 1 admin, revisit kalau ada lebih dari 1 admin nanti.
- **Live Preview Versi B** (real-time sync sambil mengetik, sebelum simpan): ditunda — Versi A (tombol buka halaman publik setelah simpan) dikerjakan sekarang, lihat Task 14.

### [x] Task 14 — Admin: Tombol Preview Publik (Selesai & Terverifikasi)

Tambahkan tombol "Lihat di Halaman Publik" di `ProductList.tsx` (tiap baris) dan di form edit produk — buka `/produk/[slug]` di tab baru. Kalau produk berstatus non-aktif, buka tetap boleh (khusus akses dari admin, bukan publik) ATAU tampilkan pesan "Aktifkan dulu untuk preview" — pilih salah satu, agent boleh tentukan yang lebih simpel.

- Acceptance: klik tombol dari admin → halaman publik produk terbuka tab baru, data sesuai yang tersimpan. (VERIFIED)
- Dependencies: Task 9 (halaman produk publik sudah ada). Scope: XS.
- Status: **SELESAI (commit `af8a887`)**.

### [x] Task 15 — Daftar Pesanan Sementara (Multi-Item WA Composer) (Selesai & Terverifikasi)

Bukan cart/checkout (tidak ada pembayaran) — cuma cara kumpulkan beberapa produk jadi 1 pesan WA terstruktur. Client-side saja (React Context + localStorage), TANPA tabel database baru.

- Tombol "Pesan via WhatsApp Sekarang" (existing, per-produk) TETAP ADA — tambahkan tombol baru "Tambah ke Daftar Pesanan" berdampingan. (VERIFIED)
- Floating badge (ikon + jumlah item) site-wide → klik buka panel daftar item (tiap item: produk, varian, addon, qty, subtotal, tombol hapus). (VERIFIED)
- Tombol "Kirim Semua via WhatsApp" di panel: generate 1 pesan terstruktur — daftar item bernomor (format label sama seperti template 1-item: Produk/Finishing/Addon/Jumlah/Harga), ditutup baris "TOTAL KESELURUHAN". (VERIFIED)
- Acceptance: tambah 2+ produk beda kategori ke daftar, kirim, 1 pesan WA berisi rincian semua item + total benar. (VERIFIED)
- Dependencies: Task 10. Scope: M.
- Status: **SELESAI & TERVERIFIKASI E2E (commit `af8a887`)**.
- ⚠️ *Catatan Maintenance*: `components/public/OrderListDrawer.tsx` sudah **195/200 baris** — pecah dulu kalau ada penambahan fitur ke file ini.

### Housekeeping & Data Cleanup Pilot (Selesai — Sep 2026)
- [x] **Nomor WhatsApp Resmi**: Database `business_info` dan seluruh fallback code di-update dari placeholder `628123456789` ke nomor resmi `0813-9028-6826` (`6281390286826`). (VERIFIED)
- [x] **Pembersihan Data Audit Teknis**: Varian `"Test Custom Finishing"` dan add-on `"Packaging Box & Wrap Eksklusif"` pada Stiker Kromo A3+ telah dihapus bersih dari database Supabase. (VERIFIED)

### Phase 4 (FUTURE — butuh sesi perencanaan terpisah, TIDAK dikerjakan sekarang)

**Sistem Akun & Login Pelanggan** — tujuan: filter pelanggan yang niat order (disebut Joe). Pertanyaan yang belum terjawab, perlu dibahas di sesi khusus sebelum ada task/schema:

- Data apa yang diminta saat daftar (nama, HP, email)?
- Bagaimana "niat order" diukur/di-filter?
- Tabel `customers` terpisah dari `admin_users` — schema & RLS baru.
- Migrasi: Daftar Pesanan localStorage (Task 15) di-merge ke akun begitu pelanggan login/daftar.
- Kaitan dengan rencana bot WA agentic (sudah dicatat sejak PRD awal).

## Risks and Mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Deskripsi produk belum siap (bottleneck yang sudah diidentifikasi) | Medium | Build tetap jalan dengan data placeholder; deskripsi dicicil paralel via tracker Notion, tidak jadi blocker Task 1-10 |
| Logic kalkulasi harga dinamis (Task 9) meleset | High | Wajib verifikasi manual dengan beberapa kombinasi sebelum checkpoint |
| Domain belum dibeli saat deploy | Low | Deploy dulu ke \*.vercel.app, sambungkan domain belakangan tanpa perlu build ulang |

## Open Questions

- Apakah foto pilot (Stiker Kromo A3+, dst) sudah tersedia untuk Task 4, atau pakai placeholder dulu?
- Target waktu penyelesaian pilot ini kapan (untuk estimasi cicilan deskripsi & build)?
