"use client";

import { useState } from "react";
import { HomeBanner } from "@/lib/types/database";
import { saveBannerAction, deleteBannerAction } from "@/app/admin/actions/banners.action";

interface Props {
  readonly initialBanners: HomeBanner[];
}

const EMPTY_FORM = { id: "", image_url: "", link_url: "/", alt_text: "Banner Joglo Print", display_order: 0, is_active: true };

export default function BannersAdminClient({ initialBanners }: Props) {
  const [banners, setBanners] = useState(initialBanners);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function openNew() {
    setForm(EMPTY_FORM);
    setIsEditing(true);
    setError(null);
  }

  function openEdit(b: HomeBanner) {
    setForm({ id: b.id, image_url: b.image_url, link_url: b.link_url, alt_text: b.alt_text, display_order: b.display_order, is_active: b.is_active });
    setIsEditing(true);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
    fd.set("is_active", form.is_active ? "true" : "false");
    const result = await saveBannerAction(fd);
    setLoading(false);
    if (!result.success) { setError(result.error || "Gagal"); return; }
    setSuccess("Banner tersimpan!"); setIsEditing(false);
    // Refresh: reload page data inline
    window.location.reload();
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus banner ini?")) return;
    const result = await deleteBannerAction(id);
    if (!result.success) { alert(result.error); return; }
    setBanners((prev) => prev.filter((b) => b.id !== id));
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <span>🖼️</span>
            <span>Manajemen Banner Homepage</span>
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Banner tampil sebagai slider full-width di atas homepage.</p>
        </div>
        <button onClick={openNew} className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2 rounded-xl text-sm shadow-xs transition">
          + Tambah Banner
        </button>
      </div>

      {success && <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 rounded-xl">{success}</div>}

      {/* Form Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="font-bold text-slate-900">{form.id ? "Edit Banner" : "Tambah Banner Baru"}</h2>
              <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-700 text-lg">✕</button>
            </div>
            {error && <p className="text-red-600 text-xs bg-red-50 border border-red-200 px-3 py-2 rounded-xl">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">URL Gambar Banner *</label>
                <input required type="url" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://res.cloudinary.com/..." className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none" />
                {form.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form.image_url} alt="preview" className="mt-2 w-full h-24 object-cover rounded-xl border border-slate-200" />
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Link URL (klik banner)</label>
                <input type="text" value={form.link_url} onChange={(e) => setForm({ ...form, link_url: e.target.value })} placeholder="/" className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Alt Text (untuk SEO/akses)</label>
                <input type="text" value={form.alt_text} onChange={(e) => setForm({ ...form, alt_text: e.target.value })} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Urutan</label>
                  <input type="number" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none" />
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-slate-700">
                    <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="h-4 w-4 rounded text-amber-600" />
                    Aktif
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl">Batal</button>
                <button type="submit" disabled={loading} className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-5 py-2 text-sm rounded-xl disabled:opacity-50">
                  {loading ? "Menyimpan..." : "Simpan Banner"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Banner List */}
      {banners.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300 text-slate-400">
          <p className="text-4xl mb-3">🖼️</p>
          <p className="font-semibold">Belum ada banner. Klik &quot;+ Tambah Banner&quot; untuk mulai.</p>
          <p className="text-xs mt-1">Jika kosong, homepage akan tampilkan hero 3-panel statis otomatis.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {banners.map((b) => (
            <div key={b.id} className="flex items-center gap-4 bg-white border border-slate-200 rounded-2xl p-3 shadow-xs">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={b.image_url} alt={b.alt_text} className="w-28 h-16 object-cover rounded-xl border border-slate-200 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">{b.alt_text}</p>
                <p className="text-xs text-slate-500 truncate">{b.link_url}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-mono text-slate-400">Urutan: {b.display_order}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${b.is_active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                    {b.is_active ? "Aktif" : "Nonaktif"}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => openEdit(b)} className="text-xs font-semibold text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg transition">Edit</button>
                <button onClick={() => handleDelete(b.id)} className="text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition">Hapus</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
