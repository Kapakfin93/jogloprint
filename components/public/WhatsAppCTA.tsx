interface WhatsAppCTAProps {
  readonly whatsappUrl: string;
  readonly whatsappNumber?: string;
  readonly productName: string;
}

export default function WhatsAppCTA({
  whatsappUrl,
  whatsappNumber = "628123456789",
  productName,
}: WhatsAppCTAProps) {
  const askYieldMessage = `Halo Joglo Print, saya mau tanya estimasi isi per lembar untuk produk ${productName}...`;
  const askYieldUrl = `https://wa.me/${whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent(askYieldMessage)}`;

  return (
    <div className="flex flex-col gap-3 pt-2">
      {/* Primary WhatsApp Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 px-6 rounded-2xl flex items-center justify-between shadow-lg shadow-emerald-900/10 transition-all transform hover:-translate-y-0.5 active:translate-y-0 group"
      >
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center text-2xl group-hover:scale-105 transition-transform">
            💬
          </div>
          <div className="flex flex-col text-left">
            <span className="text-base sm:text-lg font-black leading-tight">
              Pesan via WhatsApp Sekarang
            </span>
            <span className="text-xs text-emerald-100 opacity-90 leading-tight mt-0.5">
              Format rincian pesanan otomatis terisi ke chat operator
            </span>
          </div>
        </div>
        <span className="text-xl font-bold group-hover:translate-x-1 transition-transform">
          →
        </span>
      </a>

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
