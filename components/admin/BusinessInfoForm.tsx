"use client";

import { useState } from "react";
import { BusinessInfo } from "@/lib/types/database";
import { saveBusinessInfoAction } from "@/app/admin/actions/business-info.action";

const DAYS_OF_WEEK = [
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
  "Minggu",
] as const;

interface BusinessInfoFormProps {
  readonly initialData: BusinessInfo;
}

export default function BusinessInfoForm({ initialData }: BusinessInfoFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form State
  const [name, setName] = useState(initialData.name || "Joglo Print Demak");
  const [tagline, setTagline] = useState(initialData.tagline || "");
  const [address, setAddress] = useState(
    initialData.address ||
      "Jl. Diponegoro, Rw. 4, Jogoloyo, Kec. Wonosalam, Kab. Demak, Jateng 59571"
  );
  const [city, setCity] = useState(initialData.city || "Demak");
  const [postalCode, setPostalCode] = useState(initialData.postal_code || "59571");
  const [whatsappNumber, setWhatsappNumber] = useState(
    initialData.whatsapp_number || "628123456789"
  );
  const [phone, setPhone] = useState(initialData.phone || "0812-3456-7890");
  const [email, setEmail] = useState(initialData.email || "halo@jogloprint.id");
  const [mapsUrl, setMapsUrl] = useState(initialData.google_maps_url || "");

  // Opening Hours State (7 Days)
  const [hours, setHours] = useState<Record<string, string>>(() => {
    const raw = initialData.opening_hours || {};
    const init: Record<string, string> = {};
    for (const d of DAYS_OF_WEEK) {
      init[d] = raw[d] || raw["mon_sat"] || "08:00 - 02:00 WIB";
    }
    return init;
  });

  // Shipping Coverage (Multi-line text)
  const [shippingText, setShippingText] = useState(
    (initialData.shipping_coverage || [
      "Demak & Sekitarnya: Mranggen, Karangawen, Sayung, Demak Kota",
      "Kudus, Jepara, Semarang: Travel / Pengiriman Semalam",
      "Seluruh Jawa Tengah: J&T, JNE, SiCepat, Lion Parcel & Indah Cargo",
    ]).join("\n")
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.append("id", initialData.id);
      formData.append("name", name);
      formData.append("tagline", tagline);
      formData.append("address", address);
      formData.append("city", city);
      formData.append("postal_code", postalCode);
      formData.append("whatsapp_number", whatsappNumber);
      formData.append("phone", phone);
      formData.append("email", email);
      formData.append("google_maps_url", mapsUrl);
      formData.append("shipping_coverage", shippingText);

      for (const d of DAYS_OF_WEEK) {
        formData.append(`hours_${d}`, hours[d] || "08:00 - 02:00 WIB");
      }

      const res = await saveBusinessInfoAction(formData);
      if (!res.success) {
        setError(res.error || "Gagal menyimpan data");
      } else {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 4000);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan sistem");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-sm font-semibold">
          ⚠️ {error}
        </div>
      )}
      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-sm font-semibold">
          ✓ Informasi bisnis berhasil diperbarui dan diterapkan ke seluruh website!
        </div>
      )}

      {/* Section 1: Identitas & Kontak */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-800 border-b pb-2">
          🏢 Identitas Toko & Kontak
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name-input" className="block text-xs font-bold text-slate-700 mb-1">
              Nama Usaha *
            </label>
            <input
              id="name-input"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="tagline-input" className="block text-xs font-bold text-slate-700 mb-1">
              Tagline / Slogan
            </label>
            <input
              id="tagline-input"
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="whatsapp-number-input" className="block text-xs font-bold text-slate-700 mb-1">
              Nomor WhatsApp Utama (Order) *
            </label>
            <input
              id="whatsapp-number-input"
              type="text"
              required
              placeholder="Contoh: 628123456789"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="phone-input" className="block text-xs font-bold text-slate-700 mb-1">
              No. Telepon / Display
            </label>
            <input
              id="phone-input"
              type="text"
              placeholder="Contoh: 0812-3456-7890"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="email-input" className="block text-xs font-bold text-slate-700 mb-1">Email</label>
            <input
              id="email-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="maps-url-input" className="block text-xs font-bold text-slate-700 mb-1">
              URL Google Maps
            </label>
            <input
              id="maps-url-input"
              type="url"
              placeholder="https://maps.google.com/..."
              value={mapsUrl}
              onChange={(e) => setMapsUrl(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Section 2: Alamat Workshop */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-800 border-b pb-2">
          📍 Alamat Workshop
        </h3>
        <div>
          <label htmlFor="address-input" className="block text-xs font-bold text-slate-700 mb-1">
            Alamat Lengkap *
          </label>
          <textarea
            id="address-input"
            rows={2}
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="city-input" className="block text-xs font-bold text-slate-700 mb-1">Kota / Kabupaten</label>
            <input
              id="city-input"
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="postal-code-input" className="block text-xs font-bold text-slate-700 mb-1">Kode Pos</label>
            <input
              id="postal-code-input"
              type="text"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Section 3: Jam Operasional (7 Hari Terpisah) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-2 gap-2">
          <h3 className="text-base font-bold text-slate-800">
            🕒 Jam Buka per Hari (7 Hari Terpisah)
          </h3>
          <span className="text-xs text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 font-medium">
            💡 Aktual tutup ~02:00 dini hari, buka ~08:00 pagi
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {DAYS_OF_WEEK.map((day) => (
            <div key={day} className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <label htmlFor={`hours-${day}-input`} className="w-20 text-xs font-bold text-slate-700 shrink-0">{day}</label>
              <input
                id={`hours-${day}-input`}
                type="text"
                placeholder="Contoh: 08:00 - 02:00 WIB"
                value={hours[day] || ""}
                onChange={(e) =>
                  setHours((prev) => ({ ...prev, [day]: e.target.value }))
                }
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Section 4: Area Jangkauan Pengiriman */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-800 border-b pb-2">
          🚚 Area Jangkauan & Opsi Pengiriman
        </h3>
        <div>
          <label htmlFor="shipping-coverage-input" className="block text-xs font-bold text-slate-700 mb-1">
            Daftar Area / Ekspedisi (1 Baris = 1 Item)
          </label>
          <textarea
            id="shipping-coverage-input"
            rows={4}
            value={shippingText}
            onChange={(e) => setShippingText(e.target.value)}
            placeholder="Ketik satu baris untuk tiap wilayah atau metode kirim..."
            className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none font-mono text-xs leading-relaxed"
          />
        </div>
      </div>

      {/* Action Button */}
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={loading}
          className="bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold px-8 py-3 rounded-xl shadow-md transition"
        >
          {loading ? "Menyimpan..." : "💾 Simpan Informasi Bisnis"}
        </button>
      </div>
    </form>
  );
}
