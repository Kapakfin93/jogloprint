# Instruksi untuk Agent — Website Joglo Print

## Wajib dibaca dulu sebelum menulis kode apapun
1. `PRD_WEBSITE_JOGLOPRINT.md` — requirement produk, information architecture, data model lengkap, boundaries.
2. `IMPLEMENTATION_PLAN_JOGLOPRINT.md` — daftar task terurut + acceptance criteria + checkpoint. **Kerjakan sesuai urutan task di sini, jangan lompat fase.**
3. `GUIDE_CATALOG_INPUT_PROTOCOL.md` — SOP & visual data model untuk input produk/varian/addon (wajib dibaca sebelum input/seeding katalog).
4. Folder `design-reference/` — screenshot 3 halaman (Home, Kategori, Detail Produk) hasil Google Stitch yang sudah disetujui. Referensi VISUAL saja, bukan sumber schema/logic.

## Tech Stack (non-negotiable)
- Next.js App Router + Tailwind CSS
- Supabase (database baru, terpisah dari project KasirGrafity — JANGAN pernah connect ke project Supabase lain)
- Cloudinary untuk semua foto produk (bukan Supabase Storage)
- Deploy: Vercel

## Dependency yang SENGAJA Tidak Dipakai (Anti-Bloat)
Dilarang meng-install kembali dependency berikut tanpa izin eksplisit:
- **`lucide-react`**: Sudah di-uninstall. Seluruh icon di website publik maupun admin WAJIB menggunakan SVG native (inline `<svg>` yang clean & lightweight).
- **`next-cloudinary`**: Sudah di-uninstall. Image rendering dan optimasi URL transformasi Cloudinary dilakukan secara native via `lib/services/image-url.service.ts` dipadukan dengan komponen `<Image />` bawaan Next.js.

## Arsitektur Wajib: 3 Layer
Setiap fitur HARUS dipisah jadi 3 lapisan, tidak boleh dicampur dalam 1 file:

```
app/                        → LAYER 1: Presentation (UI/route only)
  (public)/produk/[slug]/page.tsx    → render UI, panggil service, TIDAK query Supabase langsung
  admin/produk/page.tsx

components/
  public/                   → Komponen publik terfokus (maks 200 baris/file)
    PublicHeader.tsx        → Navbar publik utama
    CategoryDropdown.tsx    → Desktop dropdown "Lainnya ▾" untuk kategori sisa (>5)
    CategoryDrawer.tsx      → Mobile slide-over drawer untuk seluruh list kategori
    ProductDetailClient.tsx
    ProductGallery.tsx
    VariantPriceTable.tsx
    WhatsAppCTA.tsx
    ...
  admin/                    → Komponen admin dashboard

lib/services/                → LAYER 2: Business Logic
  pricing.service.ts         → hitung harga (4 engine: sheet, bundle, area, meter_lari)
  whatsapp-message.service.ts → generate teks pesan WA terstruktur (single & multi-item)
  image-url.service.ts       → optimasi URL Cloudinary native
  slug.service.ts            → generate & validasi slug

lib/repositories/            → LAYER 3: Data Access (SATU-SATUNYA tempat yang boleh import supabase client)
  categories.repository.ts   → getCategories(), getCategoryBySlug(), createCategory(), dst
  products.repository.ts
  variants.repository.ts
  addons.repository.ts
  business-info.repository.ts

test/                        → Unit test murni (node:test bawaan)
  services-robustness.test.ts → test kondisi batas pricing & WA composer

lib/supabase/
  client.ts                  → browser client
  server.ts                  → server client
```

**Aturan tegas:**
- `app/**/page.tsx` dan komponen UI **tidak boleh** memanggil Supabase langsung — selalu lewat `lib/repositories/`.
- `lib/repositories/` **tidak boleh** berisi logic perhitungan (harga, format) — itu tugas `lib/services/`.
- `lib/services/` **tidak boleh** tahu soal Supabase sama sekali (harus bisa di-unit-test tanpa database).

## Testing & Robustness
- **Framework:** Test runner bawaan `node:test` + `node:assert/strict` (bukan Vitest/Jest, menjaga zero-dependency).
- **Lokasi Test:** Folder `test/` (misal: `test/services-robustness.test.ts`).
- **Command:** `npm test` (atau `npx tsx --test test/services-robustness.test.ts`).
- **Pola Robustness Test (Wajib untuk Service Baru):**
  Setiap logic murni baru di `lib/services/` (kalkulasi harga, formatting, WhatsApp message composer) WAJIB memiliki unit test untuk kondisi batas (boundary conditions):
  1. `qty` = 0, bernilai negatif, atau nilai ekstrim.
  2. Tiers kosong (`[]`), `null`, atau `undefined`.
  3. Dimensi 0 atau negatif untuk engine `area` dan `meter_lari`.
  4. Add-on bernilai `null` / tidak dipilih.
  5. `qty` melebihi batas tier tertinggi yang terdaftar (fallback tiering).

## Audit Trail & Deteksi Duplikat Foto
- Kolom `product_images.file_hash`: Menyimpan hash SHA-256 dari file biner gambar asli.
- **Workflow Upload:** Sebelum file dikirim ke Cloudinary, hash SHA-256 dihitung di server action (`app/actions/upload.action.ts`).
- **Deteksi Duplikat:** Hash dicek terhadap database `product_images`. Jika hash sudah pernah di-upload sebelumnya, sistem memberikan warning duplikat dan menampilkan nama produk yang sudah memakainya agar admin terhindar dari pengunggahan ganda.

## Batas Ukuran File
- **Maksimal 200 baris per file.** Kalau sebuah komponen/service/repository mendekati/melebihi itu, **pecah** jadi beberapa file yang lebih kecil dan fokus (single responsibility), jangan dipaksa muat dalam 1 file.
- Kalau 1 halaman butuh banyak sub-bagian UI (mis. halaman Detail Produk: galeri foto, pemilih varian, tabel harga, CTA WA), masing-masing jadi komponen terpisah di `components/`, bukan ditulis inline semua di `page.tsx`.

## Boundaries — tanya dulu sebelum:
- Menambah fitur cart/checkout/payment (TIDAK ada, order tetap via WhatsApp)
- Mengubah admin panel dari "isi form" menjadi page-builder bebas
- Mengubah struktur URL dari flat (`/produk/{slug}`) menjadi nested di bawah kategori
- Mengubah cara Finishing (varian bertingkat harga) vs Laminasi (add-on flat) dimodelkan
- **Mengubah tipe/struktur kolom di schema yang sudah disepakati di PRD** (mis. text → JSONB) — kalau ada alasan teknis kuat untuk mengubah, JELASKAN dulu alasannya dan tunggu konfirmasi, jangan ubah lalu lapor belakangan
- Menyimpan kredensial di kode/client-side — selalu environment variable

## Larangan
- Jangan expose tabel Supabase untuk WRITE ke publik. RLS admin **harus** dibatasi ke user/owner spesifik (mis. cek `auth.uid()` terhadap 1 ID tetap, atau email owner), **bukan** cuma `auth.role() = 'authenticated'` — karena itu berarti siapapun yang berhasil signup otomatis dapat akses tulis penuh. Pastikan juga public sign-up di Supabase Auth **dimatikan** (hanya 1 akun owner yang dibuat manual).
- Jangan generate/isi deskripsi produk dengan konten karangan — tinggalkan placeholder jelas kalau belum ada isi dari admin.
- Jangan ubah data kategori/harga yang sudah diinput admin tanpa konfirmasi.

## Env vars yang dibutuhkan
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
NEXT_PUBLIC_WHATSAPP_NUMBER=
```

## Commands
```
npm run dev
npm run build
npm run lint
npm test
vercel --prod
```

## Alur kerja per task
1. Kerjakan 1 task sesuai urutan di `IMPLEMENTATION_PLAN_JOGLOPRINT.md`.
2. Cek acceptance criteria & verification task tsb satu-satu sebelum lapor selesai.
3. Di tiap Checkpoint, berhenti dan laporkan ke Joe untuk review — jangan lanjut sendiri melewati checkpoint.
4. Kalau menyimpang dari schema/keputusan yang sudah ada di PRD, JELASKAN alasannya di laporan, jangan diam-diam diubah.
