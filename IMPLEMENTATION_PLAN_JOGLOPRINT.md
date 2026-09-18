# Implementation Plan: Website Joglo Print — Pilot Kategori Stiker & Label

## Overview

Membangun website katalog Joglo Print (Home → Kategori → Produk) + admin dashboard CRUD, database Supabase terpisah, deploy Vercel. Desain visual sudah final di Google Stitch (3 halaman: Home, Kategori Stiker & Label, Detail Produk Stiker Kromo A3+) — dipakai sebagai referensi visual, bukan sumber kode literal. Scope pilot: 1 kategori penuh (Stiker & Label) untuk membuktikan alur admin → database → frontend, sebelum direplikasi ke kategori lain.

**Dokumen operasional terkait (baca sebelum kerja isi data):** `GUIDE_UPLOAD_KATEGORI_PRODUK.md` dan `GUIDE_CATALOG_INPUT_PROTOCOL.md` — panduan cepat alur input kategori/produk/varian/addon/foto untuk agent manapun di sesi manapun.

## Architecture Decisions

- **Monorepo Next.js (App Router)**, publik + admin dalam 1 codebase.
- **Supabase project baru**, terpisah total dari KasirGrafity.
- **URL flat** (`/produk/{slug}`, bukan nested di bawah kategori) — supaya produk bisa pindah kategori tanpa merusak SEO.
- **Finishing = varian bertingkat harga** (`product_variants` + `variant_price_tiers`); **Laminasi/Add-on = flat atau proporsional tergantung engine** (`product_addons`).
- **Cloudinary** untuk foto (bukan Supabase Storage), hash SHA-256 dihitung sebelum upload untuk audit trail & deteksi duplikat (lihat Task 18).
- **Tanpa cart/checkout berbayar** — CTA "Pesan via WhatsApp" generate teks terstruktur berlabel tetap, plus "Daftar Pesanan" multi-item (Task 15) untuk gabung beberapa produk jadi 1 pesan WA. Disiapkan supaya kompatibel di-parsing bot WA di masa depan.
- **Layout "dikunci" di kode** (hasil Stitch) — admin panel hanya CRUD data (teks, harga, foto), bukan page builder.
- Skema disiapkan agar mudah ditambah tabel `orders` nanti (ekstensi masa depan untuk bot agentic) — tidak dibangun sekarang (YAGNI).
- **Semua mutasi admin WAJIB lewat `requireAdminMutationClient()`** (lihat Risks table — Security Hardening RESOLVED) — tidak ada lagi bypass RLS tanpa verifikasi sesi.

### Addendum: Multi-Engine Pricing (diputuskan setelah audit arsitektur, menyusul Task 6)

Ditemukan kebutuhan nyata: tidak semua kategori Joglo Print dihitung per-lembar (stiker). Banner dihitung per m², Spanduk Kain per meter lari. Keputusan setelah audit:

- **4 engine**: `sheet` (lembar/pcs, default), `bundle` (buku/rim), `area` (m², dihitung dari panjang×lebar cm), `meter_lari` (per meter panjang).
- **Engine adalah properti Kategori** (`categories.pricing_engine`), cascade otomatis ke `products.pricing_model` & `unit_label` via DB trigger saat kategori diedit.
- **`sheet`/`bundle`** tetap 100% pakai mekanisme `product_variants`+`variant_price_tiers` yang sudah ada sejak awal (tidak ada perubahan). Add-on dihitung flat per-pcs/buku: `(unitPrice + addonFlat) * qty`.
- **`area`**: dihitung dari 2 dimensi (panjang×lebar cm) via `calculateAreaPrice()`, pure function terpisah di `pricing.service.ts`. Minimal order pakai `products.min_order_qty` (di-rename dari `min_order_area`). Add-on dihitung proporsional terhadap luas bahan terpakai (`billedAreaM2`), yaitu `billedAreaM2 * (pricePerM2 + addonFlat) * qty`.
- **`meter_lari`**: dihitung dari 1 dimensi (panjang meter) via `calculateMeterLariPrice()`, pure function terpisah. **Lebar bahan TIDAK mempengaruhi harga** — cuma info di `specifications` (dikonfirmasi Joe, mengacu pricelist supplier: harga/meter sama untuk semua pilihan lebar). Varian (`product_variants`) untuk kategori ini tetap dipakai untuk axis Finishing (mis. "Obras + Tali Samping"), bukan lebar. Add-on dihitung flat per-meter: `(unitPrice + addonFlat) * lengthM`.
- **Kolom `variant_price_tiers.price_per_unit` reinterpretasi kontekstual** sesuai `pricing_model` produk induknya (Rp/lembar, Rp/m², atau Rp/meter) — didokumentasikan via `COMMENT ON COLUMN` di database, WAJIB selalu join ke `products.pricing_model` sebelum menafsirkan nilai ini di query manapun.
- **Kolom `product_addons.price_flat` reinterpretasi kontekstual** sesuai `pricing_model` produk induknya: untuk engine `area` bermakna Rp/m² (dikalikan `billedAreaM2`); untuk `sheet`/`bundle`/`meter_lari` bermakna flat nominal per satuan. Didokumentasikan via `COMMENT ON COLUMN public.product_addons.price_flat`.

### Addendum: Addon Selection Mode (Task 20)

Kategori Kaos & Jersey butuh kombinasi add-on yang bisa ditumpuk (mis. Lengan Panjang DAN Kerah Polo sekaligus) — beda dari Stiker yang addon-nya mutually exclusive (Laminasi Glossy ATAU Doff, tidak bisa dua-duanya).

- Kolom baru `categories.addon_selection_mode` (`'single'` default, atau `'multi'`) — pola sama seperti `pricing_engine`, properti di level Kategori, dikonsumsi turunan oleh halaman produk (`category.addon_selection_mode`, BUKAN kolom di `products`).
- `single`: radio card, exclusive (Stiker & Label dan semua kategori lain tetap begini, tidak berubah).
- `multi`: checkbox, akumulatif — total addon = jumlah semua yang dicentang. HANYA di-set untuk kategori yang fiturnya genuinely independen/bisa digabung (saat ini: Kaos & Jersey).
- `pricing.service.ts`: `calculateTotalAddons()` menerima array addon terpilih, akumulasi total (test case boundary: array kosong/null, 1 item, banyak item, campur Rp0/null/undefined — lihat Task 17).
- `AddonSelector.tsx`: render checkbox hijau kalau mode `multi`, radio card kalau `single`. Badge harga add-on yang description-nya mengandung "BELUM FINAL" otomatis tampil "Hub. CS" (bukan "+Rp 0") supaya tidak menyesatkan pengunjung mengira gratis — badge diletakkan di BAWAH judul (bukan sejajar) supaya nama varian/finishing panjang tidak ter-truncate.
- Terverifikasi: regresi Stiker & Label (tetap single-select, addon gratis asli tetap tampil "+Rp 0 (Bawaan)" normal) dan Kaos & Jersey (multi-select akumulatif) — keduanya diuji dengan bukti screenshot nyata.
- Dokumentasi lengkap tabel single vs multi ada di `GUIDE_CATALOG_INPUT_PROTOCOL.md` bagian C dan `GUIDE_UPLOAD_KATEGORI_PRODUK.md`.

## Task List

### Phase 1: Foundation

- [x] **Task 1 — Setup Supabase project + schema.** (VERIFIED)
- [x] **Task 2 — Setup Next.js repo skeleton.** (VERIFIED)

### Checkpoint: Foundation

- [x] Supabase & Next.js saling terhubung (VERIFIED)
- [x] Deploy pipeline Vercel jalan otomatis dari git push (VERIFIED)

### Phase 2: Core Features (Vertical Slice — Kategori Stiker & Label)

- [x] **Task 3 — Admin: CRUD Kategori.** (VERIFIED)
- [x] **Task 4 — Admin: CRUD Produk + Foto (Cloudinary).** (VERIFIED)
- [x] **Task 5 — Admin: CRUD Varian (Finishing) + Tier Harga.** Nama varian BEBAS, tidak ter-hardcode. (VERIFIED)
- [x] **Task 6 — Admin: CRUD Add-on (Laminasi).** (VERIFIED)
- [x] **Task 7 — Halaman publik: Home.** (VERIFIED)
- [x] **Task 8 — Halaman publik: Kategori.** (VERIFIED)
- [x] **Task 9a — Detail Produk: layout statis + pemilih Finishing.** (VERIFIED)
- [x] **Task 9b — Detail Produk: pemilih Add-on.** (VERIFIED)
- [x] **Task 9c — Detail Produk: input qty + kalkulasi total harga live.** 4 kombinasi teruji cocok persis hitungan manual. (VERIFIED)
- [x] **Task 10 — CTA WhatsApp terstruktur.** (VERIFIED)

### Checkpoint: Core Features

- [x] Alur end-to-end admin→publik→WA jalan (VERIFIED)
- [x] Review bareng Joe sebelum Phase 3 (VERIFIED)

### Phase 3: Polish & SEO

- [x] **Task 11 — Admin: form Info Bisnis.** (VERIFIED)
- [x] **Task 12 — SEO: JSON-LD & meta tags.** (VERIFIED)
- [x] **Task 13 — Sitemap & robots.txt.** (VERIFIED)

### Checkpoint: Complete (Pilot Kategori Stiker & Label)

- [x] Semua acceptance criteria Task 1-13 terpenuhi (VERIFIED)
- [ ] Domain final dibeli & disambungkan — **masih `jogloweb.vercel.app`, DNS `jogloprint.id` belum diarahkan (dikonfirmasi via probe jaringan)**
- [x] Siap direplikasi ke kategori Wave 1 lainnya (VERIFIED)

## Wave 1 — Perluasan di Luar Rencana Awal

1. **`home_banners` (`/admin/banners`)** — slider promo Home Hero. Kolom: id, title, subtitle, image_url, link_url, display_order, is_active. RLS: publik SELECT is_active=true, write admin-only.
2. **`/admin/panduan` & `GUIDE_CATALOG_INPUT_PROTOCOL.md`** — SOP visual input katalog di dalam dashboard.
3. **Kategori "Lanyard & ID Card"** — produk `id-card-pvc-custom`, PVC 54×86mm, step 5pcs, min 25pcs. 1 Muka: 8rb (min)/5rb (grosir). 2 Muka: 9rb (min)/6rb (grosir). Add-on: Tanpa Tali (Rp0), Tambah Tali (+5rb).

### [x] Task 14 — Admin: Tombol Preview Publik. (VERIFIED, commit `af8a887`)

### [x] Task 15 — Daftar Pesanan Sementara (Multi-Item WA Composer). Client-side, localStorage, tanpa tabel DB baru. (VERIFIED, commit `af8a887`)

### [x] Task 16 — Dead Code & Dependency Pruning Audit. `lucide-react` & `next-cloudinary` di-uninstall, 0 sisa import. (VERIFIED)

### [x] Task 17 — Robustness Testing Suite. `test/` pakai `node:test` bawaan, `npm test` = 3 suites/14 test (termasuk `calculateTotalAddons` multi-select). (VERIFIED)

### [x] Task 18 — Hash Audit Trail & Deteksi Duplikat Foto. `product_images.file_hash` (SHA-256), peringatan non-blocking kalau ada duplikat. (VERIFIED)

### [x] Task 19 — Redesign Navigasi PublicHeader & Mobile Drawer. Desktop: 5 kategori + dropdown "Lainnya". Mobile: drawer full-list. Section ikon kategori Home tetap dipertahankan (keputusan eksplisit Joe). (VERIFIED)

### [x] Task 20 — Multi-Select Add-on per Kategori. Lihat Addendum di atas. (VERIFIED)

### [x] Task 21 — Kategori Cetak Buku & Majalah (SEO Landing Cluster & Watermarked Portofolio).
- Dibuat kategori baru `Cetak Buku & Majalah` (`cetak-buku-majalah`), `pricing_engine: 'bundle'`, satuan `eksemplar`, `addon_selection_mode: 'multi'`, display order 15.
- 6 Master Produk: buku-tahunan-wisuda, booklet-company-profile, buku-modul-lks-diktat, majalah-buletin-komunitas, buku-biografi-novel-indie, buku-laporan-dinas-sop.
- 7 Foto Asli Portofolio Pemkab/DPRD/BLK Demak diberi watermark logo resmi Joglo Print (`process_watermark_photos.py`), diunggah ke Cloudinary, dan di-link ke Produk No. 3 (3 foto) & Produk No. 6 (4 foto). (VERIFIED)

### [x] Task 22 — Kategori Khusus Map Ijazah & Raport (Single-Select Add-on & SEO Landing).
- Kategori `Perlengkapan Bisnis & Kantor` dikembalikan ke `addon_selection_mode: 'multi'` agar add-on Notebook (spiral kawat + cetak logo + laminasi) tetap bisa dicentang banyak secara akumulatif.
- Dibuat kategori baru khusus: `Map Ijazah & Raport` (`map-ijazah-raport`), `pricing_engine: 'sheet'`, satuan `pcs`, `addon_selection_mode: 'single'` (Radio Card exclusive), `display_order: 16`.
- Folder spesifikasi & aset dipindahkan ke root kategori khusus: `doc_spec produck/map_ijazah_raport/` (`asset/`, `asset_foto/`, `spec_map_ijazah_raport.md`, `PRICELIST_MAP_IJAZAH_RAPORT.xlsx`).
- Produk `Map Ijazah & Raport Custom Emboss Foil Emas` (`map-ijazah-raport`) dipindahkan ke kategori baru ini:
  - 3 Varian: Standard (Rp 15.000), Medium (Rp 22.000), Premium (Rp 35.000).
  - 3 Tier Diskon Grosir: 1-50 pcs (Normal), 51-200 pcs (-Rp 1.000), 201+ pcs (-Rp 2.500).
  - 4 Addon Isian Plastik Doff (Single-Select): 2 lembar (Free), 4 lembar (+Rp 2.000), 6 lembar (+Rp 4.000), 10 lembar (+Rp 8.000).
- Terverifikasi via automated tests (14/14 PASS) dan visual browser testing. (VERIFIED)

### Housekeeping & Data Cleanup Pilot

- [x] Nomor WhatsApp resmi (0813-9028-6826) di seluruh fallback code & DB. (VERIFIED)
- [x] Data uji coba ("Test Custom Finishing", dll) dibersihkan dari Stiker Kromo A3+. (VERIFIED)
- [x] SSR Hydration Elimination (`useSyncExternalStore`, canonical URL) — 0 console warning. (VERIFIED)
- [x] Badge "Hub. CS" untuk addon berdeskripsi "BELUM FINAL" (bukan "+Rp 0" polos) + fix layout judul terpotong di `AddonSelector.tsx`. (VERIFIED)

## STATUS TERBUKA SAAT INI (per pengecekan terakhir)

- [ ] **Addon Spanduk Kain & Textile masih Rp0 "BELUM FINAL"** (Obras+Tali, Jahit Lipat, Potong Bersih — 3 produk × 3 addon). UI sudah aman (tampil "Hub. CS", bukan "gratis"), tapi harga asli belum diisi Joe.
- [ ] `<img>` biasa masih dipakai di 7 file (ProductCard, HomeCategoryIcons, HomeHero, ProductThumbnail, ProductImageUploader, CategoryFormModal, BannersAdminClient) — cuma `ProductGallery.tsx` yang sudah pakai `<Image />`. Lihat Pre-Launch Checklist.
- [ ] Domain `jogloprint.id` belum tersambung (DNS belum diarahkan).
- [ ] Repo GitHub masih **PUBLIC** — wajib private sebelum go-live.
- [x] Security Hardening (admin mutation bypass) — RESOLVED, lihat Risks table.
- [x] Multi-select addon — sudah teruji end-to-end di Kaos & Jersey oleh Joe.

## Pre-Launch Checklist (cek sebelum situs live publik / repo private)

- [ ] Kosongkan Daftar Pesanan (localStorage) di browser kerja — Joe sengaja memakainya sebagai log pembanding template WA antar kategori selama testing Wave 1 (BUKAN sampah/bug, jangan dihapus sebelum go-live tanpa izin Joe). WAJIB dikosongkan sebelum situs benar-benar publik.
- [ ] Ganti 7 file `<img>` → `<Image />` Next.js (lihat daftar di "Status Terbuka").
- [x] Task 12 & 13 selesai (SEO). (VERIFIED)
- [ ] Repo GitHub diubah ke Private.
- [ ] Domain final dibeli & disambungkan.

## Backlog Keamanan (optional, bukan blocker launch)

- **Cloudflare Turnstile + WAF admin**: revisit kalau ada sinyal ancaman nyata, belum perlu sekarang.
- **TIDAK diadopsi**: sembunyikan URL `/admin` — security-through-obscurity, proteksi asli sudah lewat Supabase Auth + `admin_users` + RLS + `requireAdminMutationClient()`.

## Catatan Repo

- Repo GitHub (`Kapakfin93/jogloprint`) sengaja **PUBLIC** untuk fase pre-build/audit (supaya bisa diverifikasi langsung). **WAJIB diubah ke Private sebelum go-live.**

## Backlog (belum prioritas)

- **SKU auto-generate**: manual/NULL, belum urgent.
- **Uji nyata parallel deletion**: klaim "aman via ACID" masih teoretis, belum dites 2 tab bersamaan. Risiko rendah untuk 1 admin.
- **Live Preview Versi B** (real-time sambil mengetik): ditunda, Versi A (Task 14) sudah cukup.

## Phase 4 (FUTURE — sesi perencanaan terpisah, TIDAK dikerjakan sekarang)

**Sistem Akun & Login Pelanggan** — tujuan: filter pelanggan yang niat order. Belum terjawab: data pendaftaran apa saja, cara ukur "niat order", tabel `customers` terpisah dari `admin_users` (schema+RLS baru), migrasi Daftar Pesanan localStorage ke akun, kaitan dengan bot WA agentic (n8n + Fonnte + paket AI automasi yang sudah dibeli Joe — lihat histori diskusi).

## Risks and Mitigations

| Risk                                                                            | Impact              | Mitigation                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ------------------------------------------------------------------------------- | ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Deskripsi produk belum siap                                                     | Medium              | Build tetap jalan dengan placeholder; dicicil via tracker Notion                                                                                                                                                                                                                                                                                                                                                                                     |
| Logic kalkulasi harga dinamis meleset                                           | High                | Verifikasi manual multi-kombinasi tiap engine sebelum checkpoint                                                                                                                                                                                                                                                                                                                                                                                     |
| Domain belum dibeli saat deploy                                                 | Low                 | Deploy dulu ke \*.vercel.app, sambungkan domain belakangan                                                                                                                                                                                                                                                                                                                                                                                           |
| **[RESOLVED] Security Hardening: Admin Mutation Enforces Session Verification** | **None (Resolved)** | `getMutationClient()` diganti `requireAdminMutationClient()` di semua repository (products, categories, variants, addons, product-images, home-banners, business-info). Wajib lolos `auth.getUser()` + cek `admin_users`, gagal → UNAUTHORIZED/FORBIDDEN. `middleware.ts` + `app/admin/layout.tsx` redirect akses tanpa sesi ke login. Terverifikasi dengan uji POSITIF (admin asli login & mutasi berhasil) dan NEGATIF (anon/token palsu ditolak). |

## Open Questions

- Foto pilot lengkap untuk semua produk Wave 1 — masih dicicil bertahap oleh Joe.
- Harga asli Finishing Spanduk Kain — menunggu Joe.
