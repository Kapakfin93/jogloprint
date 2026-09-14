interface WhatsAppCTAProps {
  readonly whatsappUrl: string;
  readonly whatsappNumber?: string;
  readonly productName: string;
  readonly onAddToOrderList?: () => void;
  readonly isAddedSuccess?: boolean;
}

export default function WhatsAppCTA({
  whatsappUrl,
  whatsappNumber = "6281390286826",
  productName,
  onAddToOrderList,
  isAddedSuccess = false,
}: WhatsAppCTAProps) {
  const askYieldMessage = `Halo Joglo Print, saya mau tanya estimasi isi per lembar untuk produk ${productName}...`;
  const askYieldUrl = `https://wa.me/${whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent(askYieldMessage)}`;

  return (
    <div className="flex flex-col gap-3 pt-2">
      {/* Dual Order Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Secondary Action: Add to Multi-Item List */}
        {onAddToOrderList && (
          <button
            type="button"
            onClick={onAddToOrderList}
            className={`w-full py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2.5 font-bold text-sm border-2 transition-all transform active:scale-98 cursor-pointer ${
              isAddedSuccess
                ? "bg-emerald-50 text-emerald-700 border-emerald-500 shadow-sm"
                : "bg-white hover:bg-amber-50/50 text-primary border-primary shadow-xs hover:shadow-md"
            }`}
          >
            <span className="text-xl">{isAddedSuccess ? "✓" : "📋"}</span>
            <span>
              {isAddedSuccess ? "Berhasil Ditambahkan!" : "+ Tambah ke Daftar Pesanan"}
            </span>
          </button>
        )}

        {/* Primary Action: Direct WhatsApp Order */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2.5 shadow-md shadow-emerald-900/10 transition-all transform active:scale-98 group font-bold text-sm ${
            onAddToOrderList ? "" : "md:col-span-2"
          }`}
        >
          <span className="text-xl group-hover:scale-110 transition-transform">💬</span>
          <span>Pesan Langsung via WhatsApp</span>
          <span className="text-base group-hover:translate-x-0.5 transition-transform">→</span>
        </a>
      </div>

      {/* Secondary Quick Action & Workshop Note */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <a
          href={askYieldUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full bg-white hover:bg-slate-50 text-slate-800 py-2.5 px-4 rounded-xl border border-slate-200/90 flex items-center justify-center gap-2 text-xs font-bold shadow-xs transition"
        >
          <span>📐</span>
          <span>Tanya Estimasi Isi per Lembar</span>
        </a>

        <div className="flex items-center justify-center gap-1.5 px-3 py-2 text-slate-500 text-xs font-medium text-center bg-slate-100/70 rounded-xl">
          <span>📍</span>
          <span>Ambil di Jogoloyo Demak / Kirim Ekspedisi</span>
        </div>
      </div>
    </div>
  );
}
