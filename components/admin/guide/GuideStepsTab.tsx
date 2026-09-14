export default function GuideStepsTab() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative">
          <div className="h-8 w-8 rounded-lg bg-amber-100 text-amber-800 font-extrabold flex items-center justify-center text-sm mb-3">
            1
          </div>
          <h3 className="font-bold text-slate-800 text-sm mb-1">Cek Kategori</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Pastikan kategori sudah memiliki <b>Engine Guard</b> yang tepat (Sheet, Area, Meter Lari, Bundle).
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative">
          <div className="h-8 w-8 rounded-lg bg-amber-100 text-amber-800 font-extrabold flex items-center justify-center text-sm mb-3">
            2
          </div>
          <h3 className="font-bold text-slate-800 text-sm mb-1">Input Master Produk</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Isi nama, slug, unit satuan standar, min order, foto Cloudinary, dan spesifikasi key-value.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative">
          <div className="h-8 w-8 rounded-lg bg-amber-100 text-amber-800 font-extrabold flex items-center justify-center text-sm mb-3">
            3
          </div>
          <h3 className="font-bold text-slate-800 text-sm mb-1">Varian & Tier Harga</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Buat sumbu harga utama, lalu atur tiering grosir bertingkat (min-max kuantiti tanpa celah).
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative">
          <div className="h-8 w-8 rounded-lg bg-amber-100 text-amber-800 font-extrabold flex items-center justify-center text-sm mb-3">
            4
          </div>
          <h3 className="font-bold text-slate-800 text-sm mb-1">Add-on (Finishing Flat)</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Tambahkan opsi opsional pelengkap (seperti Laminasi Glossy/Doff, Mata Ayam, Jilid).
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-amber-200 bg-amber-50/50 shadow-xs relative">
          <div className="h-8 w-8 rounded-lg bg-amber-600 text-white font-extrabold flex items-center justify-center text-sm mb-3">
            5
          </div>
          <h3 className="font-bold text-slate-800 text-sm mb-1">Verifikasi E2E Publik</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Klik <b>&quot;Lihat di Publik ↗&quot;</b>, coba ganti varian, centang add-on, tes keranjang & draft WA.
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3">
        <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
          <span>⚠️</span> Checklist Anti-Error Sebelum Publikasi
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
          <div className="flex items-start gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-emerald-600 font-bold">✓</span>
            <span><b>Engine Guard Cocok:</b> Produk m² (MMT) tidak boleh masuk ke kategori Lembaran (sheet).</span>
          </div>
          <div className="flex items-start gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-emerald-600 font-bold">✓</span>
            <span><b>Tier Tidak Bolong:</b> Rentang kuantiti tersambung rapat (1-9, 10-49, 50-99999).</span>
          </div>
          <div className="flex items-start gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-emerald-600 font-bold">✓</span>
            <span><b>Tier Terakhir Terbuka:</b> Max qty tier tertinggi diisi 99999 untuk grosir tak terbatas.</span>
          </div>
          <div className="flex items-start gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-emerald-600 font-bold">✓</span>
            <span><b>Status Aktif:</b> Master produk dan minimal 1 varian bertanda aktif (hijau).</span>
          </div>
        </div>
      </div>
    </div>
  );
}
