# PROTOKOL GIT & DEPLOYMENT (HUSKY-POWERED) — JOGLOWEB

Diadaptasi dari protokol KasirGrafity. SOP mutlak bagi AI Agent untuk SEMUA commit di repo jogloweb, mulai dari commit pertama.

---

## 🔧 SETUP AWAL (SEKALI SAJA — belum ada di jogloweb, install sekarang)

```
npm install --save-dev husky lint-staged
npx husky init
```

Isi `.husky/pre-commit`:

```
npx lint-staged
```

Tambahkan di `package.json`:

```json
"lint-staged": {
  "*.{ts,tsx}": ["eslint --fix"]
}
```

Tambahkan hook build-gate di `.husky/pre-commit` (setelah lint-staged):

```
npm run build
```

---

## 🧹 PRE-FLIGHT (CLEANUP)

1. Hapus semua file pengujian sementara, log debug, file `.txt` draf sesi koding.
2. Pindahkan catatan yang masih ingin disimpan tapi tidak untuk di-commit ke `.scratch/` (tambahkan ke `.gitignore`).
3. **Khusus jogloweb**: cek folder `doc_spec produck/` — kalau isinya data harga/referensi internal sensitif, masukkan ke `.gitignore`, JANGAN ikut commit.

---

## 📍 CHECKPOINT 1: AUDIT KLASIFIKASI (READY VS HOLD)

```
git status
git diff --name-only
```

Tampilkan tabel:

| File     | Status             | Kategori   | Alasan & Dampak |
| -------- | ------------------ | ---------- | --------------- |
| `<file>` | Modified/Untracked | READY/HOLD | ...             |

🛑 **HALT: Minta konfirmasi Joe. Dilarang lanjut ke Checkpoint 2 sebelum disetujui.**

---

## 📍 CHECKPOINT 2: STAGING SPESIFIK & VERIFIKASI

Aturan mutlak: **DILARANG KERAS** `git add .` atau `git add -A`. **WAJIB** `git add <file>` spesifik per file READY.

```
git add <file_ready_1> <file_ready_2>
git status --short
```

Verifikasi: simbol `M `/`A ` HANYA pada file READY; simbol ` M`/`??` (HOLD) TIDAK ikut staged.

🛑 **HALT: Tampilkan `git status --short`, minta konfirmasi Joe sebelum commit.**

---

## 📍 CHECKPOINT 3: COMMIT & HUSKY GATE

```
git commit -m "<type>: <deskripsi singkat>"
```

Husky otomatis: lint-staged → hard-block kebocoran `.env`/`.next`/`.scratch` → build test (`npm run build`).

Jika Husky gagal: commit dibatalkan otomatis, agent perbaiki file READY terkait, ulangi Checkpoint 2.

---

## 📍 CHECKPOINT 4: PUSH & LAPORAN FINAL

Push HANYA setelah Checkpoint 3 lulus (exit code 0).

```
git push origin main
```

_(Branch: pakai `main` untuk sekarang — solo dev, pilot stage. Feature branch per fitur besar bisa mulai dipakai setelah situs live/kolaborator bertambah.)_

Laporan wajib: Status Deploy (SUCCESS/FAILED), Branch, Commit Message, File ter-push, File di-hold (tetap lokal).
