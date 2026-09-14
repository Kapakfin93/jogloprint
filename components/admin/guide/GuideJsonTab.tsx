const SAMPLE_JSON = {
  category_slug: "stiker-label",
  product: {
    name: "Stiker Vinyl Transparan A3+",
    slug: "stiker-vinyl-transparan-a3",
    unit_label: "lembar",
    min_order_qty: 1,
    description: "Stiker plastik transparan tahan air untuk label botol dan kemasan bening.",
    specifications: [
      { key: "Bahan", value: "Vinyl Transparan Waterproof" },
      { key: "Area Cetak", value: "31.5 x 47.5 cm" }
    ],
    images: ["https://res.cloudinary.com/jogloprint/image/upload/sample.jpg"],
    is_active: true
  },
  variants: [
    {
      name: "Kiss Cut",
      sort_order: 1,
      price_tiers: [
        { min_qty: 1, max_qty: 9, price_per_unit: 9000, lead_time_days: 1 },
        { min_qty: 10, max_qty: 49, price_per_unit: 8000, lead_time_days: 1 },
        { min_qty: 50, max_qty: 99999, price_per_unit: 7000, lead_time_days: 2 }
      ]
    }
  ],
  addons: [
    { name: "Laminasi Doff", price: 2000, sort_order: 1 },
    { name: "Laminasi Glossy", price: 2000, sort_order: 2 }
  ]
};

export default function GuideJsonTab() {
  const handleCopy = () => {
    const jsonText = JSON.stringify(SAMPLE_JSON, null, 2);
    navigator.clipboard.writeText(jsonText);
    alert("JSON template berhasil disalin ke clipboard!");
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-800 text-sm">Skema JSON Standar untuk AI / Batch Ingestion</h3>
          <p className="text-xs text-slate-500">Format standar jika input dilakukan otomatis melalui agen AI atau script</p>
        </div>
        <button
          onClick={handleCopy}
          className="px-3 py-1.5 rounded-lg bg-slate-800 text-white text-xs font-bold hover:bg-slate-700 transition"
        >
          📋 Salin JSON Template
        </button>
      </div>
      <pre className="p-4 bg-slate-900 text-amber-300 rounded-xl font-mono text-xs overflow-x-auto max-h-96">
        {JSON.stringify(SAMPLE_JSON, null, 2)}
      </pre>
    </div>
  );
}
