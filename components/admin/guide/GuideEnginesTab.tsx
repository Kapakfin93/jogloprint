export default function GuideEnginesTab() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="px-3 py-1 rounded-lg bg-blue-50 text-blue-700 font-bold text-xs uppercase border border-blue-200">
            📄 Engine: sheet
          </span>
          <span className="text-xs font-semibold text-slate-500">Satuan: lembar / pcs</span>
        </div>
        <h3 className="font-bold text-slate-800 text-base">Lembaran / Pcs Digital</h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          Customer hanya memilih jumlah lembar. Tier harga dihitung per lembar bertingkat.
        </p>
        <div className="p-3 bg-slate-50 rounded-xl font-mono text-[11px] text-slate-700 border border-slate-200">
          Total = (Harga Tier + Σ Addon) × Qty Lembar
        </div>
        <p className="text-[11px] text-slate-500">
          <b>Contoh:</b> Stiker A3+, Flyer, Brosur, Kartu Nama, Sertifikat.
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="px-3 py-1 rounded-lg bg-amber-50 text-amber-800 font-bold text-xs uppercase border border-amber-200">
            📐 Engine: area
          </span>
          <span className="text-xs font-semibold text-slate-500">Satuan: pcs (P × L cm)</span>
        </div>
        <h3 className="font-bold text-slate-800 text-base">Luas Area Meter Persegi (m²)</h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          Customer mengisi dimensi Panjang & Lebar (cm). Sistem otomatis menghitung total m² dan mengalikan harga per m².
        </p>
        <div className="p-3 bg-slate-50 rounded-xl font-mono text-[11px] text-slate-700 border border-slate-200">
          Luas m² = (P × L / 10000) × Qty<br />
          Total = (Harga per m² × Luas Billed) + (Σ Addon × Qty)
        </div>
        <p className="text-[11px] text-slate-500">
          <b>Contoh:</b> Spanduk Banner MMT Outdoor, Indoor Albatros, Backlite UV.
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-bold text-xs uppercase border border-emerald-200">
            📏 Engine: meter_lari
          </span>
          <span className="text-xs font-semibold text-slate-500">Satuan: meter</span>
        </div>
        <h3 className="font-bold text-slate-800 text-base">Meter Lari / Roll Panjang</h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          Lebar bahan sudah tetap (misal 58cm atau 120cm). Customer hanya memasukkan panjang dalam meter.
        </p>
        <div className="p-3 bg-slate-50 rounded-xl font-mono text-[11px] text-slate-700 border border-slate-200">
          Total = (Harga per Meter + Σ Addon) × Panjang Meter
        </div>
        <p className="text-[11px] text-slate-500">
          <b>Contoh:</b> Cetak DTF Sablon Kaos Roll, Kain Textile Bendera, Polyflex.
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="px-3 py-1 rounded-lg bg-purple-50 text-purple-800 font-bold text-xs uppercase border border-purple-200">
            📚 Engine: bundle
          </span>
          <span className="text-xs font-semibold text-slate-500">Satuan: buku / rim / pack</span>
        </div>
        <h3 className="font-bold text-slate-800 text-base">Paket / Buku / Rim</h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          Harga dihitung per kemasan bundle atau per buku dengan minimal pesanan khusus (misal min. 10 buku).
        </p>
        <div className="p-3 bg-slate-50 rounded-xl font-mono text-[11px] text-slate-700 border border-slate-200">
          Total = (Harga per Buku/Bundle + Σ Addon) × Qty Buku
        </div>
        <p className="text-[11px] text-slate-500">
          <b>Contoh:</b> Nota NCR 2-3 Ply, Karcis Tiket Perforasi, Stopmap Map Raport.
        </p>
      </div>
    </div>
  );
}
