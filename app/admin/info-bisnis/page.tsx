import { getBusinessInfo } from "@/lib/repositories/business-info.repository";
import BusinessInfoForm from "@/components/admin/BusinessInfoForm";
import { BusinessInfo } from "@/lib/types/database";

export const dynamic = "force-dynamic";

export default async function AdminBusinessInfoPage() {
  const businessInfo = await getBusinessInfo();

  // Fallback default structure if DB row is empty
  const defaultInfo: BusinessInfo = businessInfo || {
    id: "e2676b93-a2a8-4a46-bb0f-096d5bd98a0a",
    name: "Joglo Print Demak",
    tagline: "Percetakan Digital & Offset Melayani UMKM, Instansi, dan Masyarakat Demak & Sekitarnya",
    address: "Jl. Diponegoro, Rw. 4, Jogoloyo, Kec. Wonosalam, Kab. Demak, Jateng 59571",
    city: "Demak",
    postal_code: "59571",
    whatsapp_number: "6281390286826",
    phone: "0813-9028-6826",
    email: "halo@jogloprint.id",
    opening_hours: {
      Senin: "08:00 - 02:00 WIB",
      Selasa: "08:00 - 02:00 WIB",
      Rabu: "08:00 - 02:00 WIB",
      Kamis: "08:00 - 02:00 WIB",
      Jumat: "08:00 - 02:00 WIB",
      Sabtu: "08:00 - 02:00 WIB",
      Minggu: "08:00 - 02:00 WIB",
    },
    shipping_coverage: [
      "Demak & Sekitarnya: Mranggen, Karangawen, Sayung, Demak Kota",
      "Kudus, Jepara, Semarang: Travel / Pengiriman Semalam",
      "Seluruh Jawa Tengah: J&T, JNE, SiCepat, Lion Parcel & Indah Cargo",
    ],
    google_maps_url: "https://maps.google.com",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Pengaturan Informasi Bisnis & Kontak
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Kelola alamat workshop, jam buka operasional per hari, nomor WhatsApp order, dan jangkauan pengiriman.
          </p>
        </div>
      </div>

      <BusinessInfoForm initialData={defaultInfo} />
    </div>
  );
}
