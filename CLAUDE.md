# Instruksi untuk Agent — Website Joglo Print

## Wajib dibaca dulu sebelum menulis kode apapun
1. `PRD_WEBSITE_JOGLOPRINT.md` — requirement produk, information architecture, data model lengkap, boundaries.
2. `IMPLEMENTATION_PLAN_JOGLOPRINT.md` — daftar task terurut + acceptance criteria + checkpoint. **Kerjakan sesuai urutan task di sini, jangan lompat fase.**
3. Folder `design-reference/` — screenshot 3 halaman (Home, Kategori, Detail Produk) hasil Google Stitch yang sudah disetujui. Referensi VISUAL saja, bukan sumber schema/logic.

## Tech Stack (non-negotiable)
- Next.js App Router + Tailwind CSS
- Supabase (database baru, terpisah dari project KasirGrafity — JANGAN pernah connect ke project Supabase lain)
- Cloudinary untuk semua foto produk (bukan Supabase Storage)
- Deploy: Vercel

## Arsitektur Wajib: 3 Layer
Setiap fitur HARUS dipisah jadi 3 lapisan, tidak boleh dicampur dalam 1 file:

```
app/                        → LAYER 1: Presentation (UI/route only)
  (public)/produk/[slug]/page.tsx    → render UI, panggil service, TIDAK query Supabase langsung
  admin/produk/page.tsx

lib/services/                → LAYER 2: Business Logic
  pricing.ts                 → hitung harga (tier + addon + qty), format currency
  whatsapp-message.ts        → generate teks pesan WA terstruktur
  slug.ts                    → generate & validasi slug

lib/repositories/            → LAYER 3: Data Access (SATU-SATUNYA tempat yang boleh import supabase client)
  categories.repository.ts   → getCategories(), getCategoryBySlug(), createCategory(), dst
  products.repository.ts
  variants.repository.ts
  addons.repository.ts
  business-info.repository.ts

lib/supabase/
  client.ts                  → browser client
  server.ts                  → server client
```

**Aturan tegas:**
- `app/**/page.tsx` dan komponen UI **tidak boleh** memanggil Supabase langsung — selalu lewat `lib/repositories/`.
- `lib/repositories/` **tidak boleh** berisi logic perhitungan (harga, format) — itu tugas `lib/services/`.
- `lib/services/` **tidak boleh** tahu soal Supabase sama sekali (harus bisa di-unit-test tanpa database).

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
vercel --prod
```

## Alur kerja per task
1. Kerjakan 1 task sesuai urutan di `IMPLEMENTATION_PLAN_JOGLOPRINT.md`.
2. Cek acceptance criteria & verification task tsb satu-satu sebelum lapor selesai.
3. Di tiap Checkpoint, berhenti dan laporkan ke Joe untuk review — jangan lanjut sendiri melewati checkpoint.
4. Kalau menyimpang dari schema/keputusan yang sudah ada di PRD, JELASKAN alasannya di laporan, jangan diam-diam diubah.
