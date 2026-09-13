# Spec: Website + Admin Dashboard Joglo Print (v2)

## Status
Draft — Fase Planning. Revisi dari v1 (landing page statis) setelah scope berkembang jadi katalog dinamis + admin dashboard. Menunggu approval Joe sebelum masuk Fase Build.

## Riwayat Perubahan Scope
- v1: 6 halaman statis, hardcoded content.
- v2 (dokumen ini): Katalog dinamis (Kategori → Produk → Varian) dikelola lewat admin dashboard, DB terpisah mandiri dari KasirGrafity, tanpa cart/checkout (order tetap via WhatsApp). Terinspirasi struktur IA anugerahprint.com, disederhanakan.

---

## Asumsi yang saya pakai (koreksi kalau salah)
1. "Kelola layout" di admin = atur urutan tampil produk/foto & ganti foto (bukan page-builder bebas) — sesuai konfirmasi terakhir.
2. Satu admin/owner (Joe) yang pegang dashboard — belum perlu multi-role/multi-user.
3. Domain masih dibeli belakangan; deploy awal bisa pakai domain sementara Vercel (*.vercel.app).
4. Bahasa situs: Indonesia.
5. Foto produk: admin upload manual lewat dashboard (bukan sinkron otomatis dari GBP/Instagram di v2 ini).
→ Koreksi sebelum saya lanjut ke Fase Build.

---

## 1. Objective
Membangun website katalog untuk Joglo Print (percetakan digital, sablon DTF, offset — Jogoloyo, Kec. Wonosalam, Kab. Demak, Jateng) dengan:
- Struktur SEO-friendly: tiap kategori & produk punya URL sendiri untuk menangkap long-tail local search.
- Admin dashboard mandiri untuk Joe kelola kategori/produk/varian/foto tanpa perlu sentuh kode.
- Tetap pakai WhatsApp sebagai satu-satunya jalur order (tidak ada cart/checkout/payment).
- Database terpisah sepenuhnya dari KasirGrafity — dikelola independen.

**Success terlihat seperti:** situs live & terindeks, Joe bisa tambah/edit produk sendiri lewat dashboard tanpa minta bantuan developer, tiap produk clickable ke WA dengan pesan pre-filled.

## 2. Strategi Rollout Bertahap
Katalog tidak di-launch sekaligus. Prioritas Wave 1 = lini yang sudah dikonfirmasi jadi kategori resmi Joglo Print (lihat tabel kategori di bawah). Kandidat lini tambahan (dari referensi anugerahprint.com: Cetak Stempel Flash Custom, Cetak Cutting Stiker A3+, Kalender Dinding & Meja, Cetak Poster A3-A0) **belum dikonfirmasi** apakah ini layanan resmi Joglo Print atau sekadar contoh referensi — masuk "Wave 2 kandidat" sampai dikonfirmasi.

**Bottleneck utama yang diidentifikasi Joe: menulis deskripsi per produk** — ini alasan pembuatan website tertunda selama ini. Solusi: dicicil per hari, ditrack di Notion terpisah (lihat bagian Tracking di bawah), bukan dikerjakan sekaligus sebelum build dimulai. Build website & pengisian deskripsi jalan paralel — halaman produk bisa live dengan deskripsi placeholder dulu, diisi bertahap oleh admin.

## 3. Tracking Progres Deskripsi Produk
Disimpan di Notion, terpisah dari project/halaman manapun: **"Joglo Print — Progres Deskripsi Produk"**. Kolom: Nama Produk, Kategori, Status (Belum dimulai/Sedang berlangsung/Selesai), Gelombang (Wave 1/Wave 2), Deskripsi Draft, Tanggal Dikerjakan, Catatan. Sudah diisi 10 baris awal untuk 6 kategori Wave 1 berdasarkan layanan yang sudah tertulis di deskripsi GBP.

## 4. Information Architecture
```
Publik:
/                          → Home (overview kategori + produk unggulan)
/kategori/{slug}           → Daftar produk dalam kategori
/produk/{slug}             → Detail produk: deskripsi, varian, harga per varian, CTA WA
/kontak                    → Alamat, jam buka (data akurat, bukan "24 jam"), peta, WA

Admin (protected, role owner):
/admin/login
/admin/kategori            → CRUD kategori (nama, slug, deskripsi, foto cover, display_order)
/admin/produk              → CRUD produk (nama, kategori, deskripsi, foto[], display_order)
/admin/produk/[id]/varian  → CRUD varian per produk (nama varian, harga, SKU opsional)
```

Pemetaan kategori awal (dari kategori GBP yang sudah ada):
| Kategori website | Sumber |
|---|---|
| Cetak Banner/MMT & Spanduk Outdoor | Toko Spanduk |
| Sablon DTF | Toko Sablon |
| Stiker & Label | Pabrik Stiker |
| Nota Custom & Kwitansi | Toko Percetakan |
| Cetak Yasin Custom | Layanan cetak digital (dikonfirmasi layanan resmi) |
| Fotokopi | Toko Fotokopi |

## 5. Tech Stack
- **Framework:** Next.js (App Router) — 1 repo (monorepo: public routes + admin routes dalam 1 codebase).
- **Backend/DB:** Supabase project BARU (terpisah total dari project KasirGrafity `batipgbnlfakwmbtdmdt`).
- **Auth admin:** Supabase Auth, 1 akun owner (pola sama seperti pembatasan role owner di KasirGrafity).
- **Storage foto:** Cloudinary (upload & hosting foto produk, bukan Supabase Storage). Admin akan mengisi/upload foto belakangan — bukan blocker untuk mulai build.
- **Data fetching:** Next.js Server Components query Supabase langsung (server-side) — tidak perlu REST API custom terpisah sebagai "jembatan". Mutasi admin (create/update/delete) pakai Next.js Server Actions ke Supabase.
- **Styling:** Tailwind CSS.
- **Hosting:** Vercel.

## 6. Data Model (draft awal)
```sql
categories (
  id, slug, name, description, cover_image_url, display_order, created_at
)
products (
  id, category_id -> categories.id, slug, name, description,
  display_order, created_at
)
product_images (
  id, product_id -> products.id, image_url, display_order
)
product_variants (
  id, product_id -> products.id, variant_name, price, sku, display_order
)
```
Catatan: skema ini sengaja mandiri dari skema KasirGrafity (tidak reuse `product_price_tiers`/six calc engines) — jadi tanpa ketergantungan ke sistem POS, sesuai keputusan "DB terpisah mandiri". Kalau nanti mau disinkronkan, itu keputusan terpisah di masa depan, bukan bagian scope ini.

## 7. Commands
```
Dev:    npm run dev
Build:  npm run build
Lint:   npm run lint
Deploy: vercel --prod
```

## 8. Project Structure
```
app/
  (public)/
    page.tsx
    kategori/[slug]/page.tsx
    produk/[slug]/page.tsx
    kontak/page.tsx
  admin/
    login/page.tsx
    kategori/page.tsx
    produk/page.tsx
    produk/[id]/varian/page.tsx
    layout.tsx            → auth guard (redirect kalau bukan owner)
lib/
  supabase/
    client.ts              → browser client
    server.ts               → server client (untuk Server Components/Actions)
components/
  ProductCard.tsx
  VariantSelector.tsx
  WhatsAppCTA.tsx
  LocalBusinessSchema.tsx  → JSON-LD, dipasang di tiap halaman publik
  admin/
    CategoryForm.tsx
    ProductForm.tsx
    ImageUploader.tsx
    ReorderList.tsx         → drag-to-reorder sederhana untuk display_order
```

## 9. On-Page SEO Checklist (per halaman kategori/produk)
- [ ] `<title>` unik: nama produk/kategori + lokasi
- [ ] Meta description unik per halaman
- [ ] H1 sesuai nama produk/kategori
- [ ] JSON-LD `Product` di halaman produk, `LocalBusiness` di semua halaman (jam buka akurat)
- [ ] Internal link: produk terkait dalam kategori sama
- [ ] Alt text gambar deskriptif
- [ ] URL slug lowercase-kebab-case, human readable

## 10. Boundaries
- **Always:** publik hanya bisa READ (RLS enforced); jam buka & alamat harus sama persis dengan GBP.
- **Ask first:** sebelum tambah fitur cart/checkout/payment; sebelum ubah dari "layout sederhana" ke page-builder bebas; sebelum sinkronisasi data ke/dari KasirGrafity; sebelum beli domain.
- **Never:** simpan kredensial Supabase di client-side untuk write access; expose tabel admin tanpa RLS (pelajaran dari insiden KasirGrafity).

## 11. Testing Strategy
- Manual QA per halaman (checklist SEO di atas) sebelum deploy.
- Cek RLS policy: coba akses `/admin` tanpa login → harus redirect; coba write via anon key → harus ditolak.
- Rich Results Test (Google) untuk validasi JSON-LD sebelum go-live.

## 12. Success Criteria
- Situs live, semua halaman kategori/produk ter-generate dari data Supabase (bukan hardcode).
- Joe bisa login ke `/admin`, tambah 1 produk baru + foto + varian, dan produk itu langsung muncul di halaman publik tanpa deploy ulang.
- Tidak ada tabel Supabase yang bisa ditulis publik (RLS terverifikasi).
- JSON-LD LocalBusiness valid & jam buka sesuai realita.

## 13. Open Questions
1. Apakah 4 kategori kandidat Wave 2 (Stempel Flash Custom, Cutting Stiker A3+, Kalender Dinding & Meja, Poster A3-A0) memang layanan resmi Joglo Print, atau hanya contoh referensi dari anugerahprint.com?
2. Logo/identitas visual — sudah ada atau perlu dibuat dulu?
3. Nama domain final?
