export default function GuideExamplesTab() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
        <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
          <span>🏷️</span> 1. Stiker Kromo A3+ (Engine: sheet)
        </h4>
        <div className="text-xs text-slate-600 space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
          <p><b>Satuan:</b> <code>lembar</code> | <b>Min Order:</b> <code>1</code></p>
          <p><b>Varian:</b> Tanpa Cutting, Kiss Cut, Die Cut</p>
          <p><b>Tiering:</b> 1-9 (Rp 8.500), 10-49 (Rp 7.500), 50+ (Rp 6.500)</p>
          <p><b>Add-on:</b> Laminasi Glossy (+Rp 2.000), Laminasi Doff (+Rp 2.000)</p>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
        <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
          <span>🚩</span> 2. Banner MMT Outdoor (Engine: area)
        </h4>
        <div className="text-xs text-slate-600 space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
          <p><b>Satuan:</b> <code>pcs</code> | <b>Min Order:</b> <code>1</code> (artinya min billed 1.0 m²)</p>
          <p><b>Varian:</b> Flexi 280gr, Flexi Higress 340gr, Flexi Korea 440gr</p>
          <p><b>Tiering per m²:</b> 1-9m² (Rp 20.000), 10-49m² (Rp 18.000), 50+m² (Rp 15.000)</p>
          <p><b>Add-on:</b> Mata Ayam 4 Sudut (+Rp 0), Selongsong Samping (+Rp 0)</p>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
        <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
          <span>👕</span> 3. Sablon DTF Roll (Engine: meter_lari)
        </h4>
        <div className="text-xs text-slate-600 space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
          <p><b>Satuan:</b> <code>meter</code> | <b>Min Order:</b> <code>1</code></p>
          <p><b>Varian:</b> DTF Pet Film Lebar 58cm Standar</p>
          <p><b>Tiering per meter:</b> 1-4m (Rp 45.000), 5-19m (Rp 40.000), 20+m (Rp 35.000)</p>
          <p><b>Add-on:</b> Press Kaos (+Rp 5.000/titik), Potong Desain (+Rp 2.000/m)</p>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
        <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
          <span>📒</span> 4. Nota NCR 2 Ply (Engine: bundle)
        </h4>
        <div className="text-xs text-slate-600 space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
          <p><b>Satuan:</b> <code>buku</code> | <b>Min Order:</b> <code>10</code></p>
          <p><b>Varian:</b> Ukuran 1/4 Folio (2 Ply), Ukuran 1/2 Folio (2 Ply)</p>
          <p><b>Tiering per buku:</b> 10-19 (Rp 12.000), 20-39 (Rp 10.500), 40+ (Rp 9.000)</p>
          <p><b>Add-on:</b> Nomorator Urut (+Rp 1.500/buku), Perforasi (+Rp 500/buku)</p>
        </div>
      </div>
    </div>
  );
}
