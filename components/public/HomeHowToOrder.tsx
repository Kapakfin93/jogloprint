export default function HomeHowToOrder() {
  const steps = [
    {
      num: 1,
      title: "PILIH",
      desc: "Produk & bahan cetak",
      bg: "bg-amber-600",
    },
    {
      num: 2,
      title: "KIRIM",
      desc: "File via WA / Email",
      bg: "bg-sky-600",
    },
    {
      num: 3,
      title: "BAYAR",
      desc: "Cek layout & DP/Transfer",
      bg: "bg-emerald-600",
    },
    {
      num: 4,
      title: "SELESAI",
      desc: "Ambil / kirim ekspres",
      bg: "bg-slate-800",
    },
  ];

  return (
    <section className="w-full py-3 mb-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex flex-col lg:flex-row items-center gap-4">
          <div className="bg-linear-to-r from-amber-600 to-amber-700 text-white px-5 py-3 rounded-xl flex items-center gap-3 shrink-0 justify-center w-full lg:w-auto shadow-sm">
            <span className="text-2xl">🛒</span>
            <div className="leading-none text-left">
              <span className="text-[10px] uppercase font-bold tracking-wider block text-amber-200">
                Panduan Cepat
              </span>
              <span className="text-base font-extrabold tracking-wide uppercase">
                CARA ORDER
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full">
            {steps.map((s) => (
              <div
                key={s.num}
                className={`${s.bg} text-white p-3 rounded-xl flex items-center gap-2.5 shadow-xs`}
              >
                <div className="w-7 h-7 rounded-full bg-white/25 flex items-center justify-center font-black text-xs shrink-0">
                  {s.num}
                </div>
                <div className="leading-tight">
                  <p className="font-extrabold text-xs uppercase tracking-wide">{s.title}</p>
                  <p className="text-[11px] text-white/90 leading-none mt-0.5">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
