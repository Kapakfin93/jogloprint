import Link from "next/link";
import { BusinessInfo, Category } from "@/lib/types/database";

interface PublicFooterProps {
  readonly businessInfo: BusinessInfo | null;
  readonly categories?: Category[];
}

export default function PublicFooter({ businessInfo, categories = [] }: PublicFooterProps) {
  const address =
    businessInfo?.address ||
    "Jl. Diponegoro, Rw. 4, Jogoloyo, Kec. Wonosalam, Kab. Demak, Jateng 59571";
  const phone = businessInfo?.phone || "0813-9028-6826";
  const waNumber = businessInfo?.whatsapp_number || "6281390286826";
  const shippingCoverage = businessInfo?.shipping_coverage || [
    "Demak & Sekitarnya: Mranggen, Karangawen, Sayung, Demak Kota",
    "Kudus, Jepara, Semarang: Travel / Pengiriman Semalam",
    "Seluruh Jawa Tengah: J&T, JNE, SiCepat, Lion Parcel & Indah Cargo",
  ];

  const renderOpeningHours = () => {
    if (!businessInfo?.opening_hours) {
      return (
        <p className="text-slate-300">
          <span className="text-emerald-400 font-semibold">Setiap Hari:</span> 08:00 - 02:00 WIB
        </p>
      );
    }

    const hours = businessInfo.opening_hours;
    const entries = Object.entries(hours);

    // If all days have the exact same hours (e.g. 08:00 - 02:00 WIB)
    const allSame =
      entries.length > 0 && entries.every(([, val]) => val === entries[0][1]);
    if (allSame && entries.length >= 7) {
      return (
        <div className="space-y-1">
          <p className="text-emerald-400 font-semibold">Buka Setiap Hari (Senin - Minggu)</p>
          <p className="text-slate-200 font-medium">{entries[0][1]}</p>
        </div>
      );
    }

    return (
      <div className="space-y-1">
        {entries.map(([day, val]) => (
          <div key={day} className="flex justify-between gap-2 text-[11px]">
            <span className="text-slate-400">{day}:</span>
            <span className="text-slate-200 font-medium">{val}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <footer className="w-full bg-slate-950 text-slate-400 pt-12 pb-8 border-t border-slate-800 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Col 1: Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-amber-600 flex items-center justify-center text-white font-black text-xl">
                JP
              </div>
              <span className="text-xl font-extrabold text-white tracking-tight">
                {businessInfo?.name || "JOGLO PRINT"}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              {businessInfo?.tagline ||
                "Pusat percetakan digital, offset, sablon DTF & merchandise terpercaya untuk UMKM, instansi, dan masyarakat Demak & sekitarnya."}
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Workshop Buka Setiap Hari
              </span>
            </div>
          </div>

          {/* Col 2: Kategori Cetak */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Kategori Produk
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/kategori/${cat.slug}`}
                    className="hover:text-amber-400 transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Workshop & Jam Buka */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Alamat Workshop
            </h4>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-300 mb-3">
              {address}
            </p>
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-xs space-y-2">
              <p className="text-slate-300 font-semibold">🕒 Jam Operasional:</p>
              {renderOpeningHours()}
            </div>
          </div>

          {/* Col 4: Hubungi Kami & Jangkauan Kirim */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Pusat Bantuan & Order
            </h4>
            <div className="space-y-3">
              <a
                href={`https://wa.me/${waNumber}?text=${encodeURIComponent("Halo Joglo Print, saya mau tanya informasi produk...")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-xl text-xs sm:text-sm font-bold shadow-md transition"
              >
                <span className="text-base">💬</span>
                <span>Chat WhatsApp: {phone}</span>
              </a>

              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
                <span className="text-slate-300 font-semibold block">🚚 Jangkauan Pengiriman:</span>
                {shippingCoverage.map((item) => (
                  <p key={item} className="leading-tight">• {item}</p>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} {businessInfo?.name || "Joglo Print Demak"}. Hak cipta dilindungi.</p>
          <div className="flex items-center gap-4">
            <Link href="/admin/login" className="hover:text-slate-400 transition">
              Portal Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
