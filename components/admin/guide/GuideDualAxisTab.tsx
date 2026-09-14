export default function GuideDualAxisTab() {
  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h3 className="text-lg font-bold text-slate-800">
          Prinsip Pemisahan Sumbu: Varian vs Add-on
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Rumus dasar: <b>Total Harga = [Harga Varian (Bertingkat Qty)] + [Harga Add-on (Biaya Flat)]</b>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-3">
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs font-bold">V</span>
            <h4 className="font-bold text-amber-900 text-sm">🔀 Sumbu VARIAN (Wajib 1 Pilihan)</h4>
          </div>
          <ul className="text-xs text-amber-900/80 space-y-2 list-disc list-inside leading-relaxed">
            <li>Opsi yang memiliki <b>tabel harga grosir sendiri (Tiering)</b>.</li>
            <li>Mengubah bahan dasar utama atau teknik potong inti.</li>
            <li>Wajib dipilih salah satu oleh customer di kalkulator.</li>
            <li><b>Contoh Benar:</b> <i>Kiss Cut vs Die Cut</i>, <i>Flexi 280g vs Flexi 440g</i>, <i>1/4 Folio vs 1/2 Folio</i>.</li>
          </ul>
        </div>

        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-full bg-slate-700 text-white flex items-center justify-center text-xs font-bold">A</span>
            <h4 className="font-bold text-slate-900 text-sm">➕ Sumbu ADD-ON (Opsi Pelengkap Flat)</h4>
          </div>
          <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside leading-relaxed">
            <li>Opsi pelengkap yang harganya <b>flat tambahan</b> per lembar/pcs.</li>
            <li>Bersifat opsional (bisa dicentang atau tidak).</li>
            <li><b>Contoh Benar:</b> <i>Laminasi Glossy (+Rp 2.000)</i>, <i>Mata Ayam 4 Sudut (+Rp 0)</i>, <i>Nomorator (+Rp 1.500)</i>.</li>
            <li><b>Dilarang:</b> Jangan membuat Varian &quot;Stiker Glossy&quot; dan &quot;Stiker Doff&quot; karena laminasi adalah add-on!</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
