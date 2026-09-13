"use client";

import { useState } from "react";
import { ProductWithDetails } from "@/lib/repositories/products.repository";
import { ProductAddon } from "@/lib/types/database";
import { deleteAddonAction } from "@/app/admin/actions/addons.action";
import { formatCurrency } from "@/lib/services/pricing.service";
import AddonFormModal from "./AddonFormModal";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface AddonManagerProps {
  readonly product: ProductWithDetails;
  readonly addons: ProductAddon[];
}

export default function AddonManager({ product, addons }: AddonManagerProps) {
  const router = useRouter();
  const [selectedAddon, setSelectedAddon] = useState<ProductAddon | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function handleAdd() {
    setSelectedAddon(null);
    setIsModalOpen(true);
  }

  function handleEdit(item: ProductAddon) {
    setSelectedAddon(item);
    setIsModalOpen(true);
  }

  async function handleDelete(item: ProductAddon) {
    if (!confirm(`Hapus opsi add-on "${item.name}"?`)) return;

    setDeletingId(item.id);
    const result = await deleteAddonAction(product.id, item.id);
    setDeletingId(null);

    if (!result.success) {
      alert(result.error || "Gagal menghapus add-on");
      return;
    }

    router.refresh();
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/produk"
          className="text-xs font-semibold text-slate-500 hover:text-amber-600 transition inline-flex items-center gap-1 mb-2"
        >
          ← Kembali ke Daftar Produk
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Kelola Add-on Produk
            </h1>
            <p className="text-sm text-slate-500">
              Produk: <strong className="text-slate-800">{product.name}</strong> ({product.category_name})
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/admin/produk/${product.id}/varian`}
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
            >
              Ke Varian Finishing →
            </Link>
            <button
              onClick={handleAdd}
              className="rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-amber-700 transition"
            >
              + Tambah Add-on
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase border-b border-slate-200">
            <tr>
              <th className="px-6 py-3.5">Urutan</th>
              <th className="px-6 py-3.5">Nama Add-on</th>
              <th className="px-6 py-3.5">Biaya Tambahan / Lembar</th>
              <th className="px-6 py-3.5">Keterangan</th>
              <th className="px-6 py-3.5">Default</th>
              <th className="px-6 py-3.5 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {addons.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                  Belum ada opsi add-on. Klik <strong>+ Tambah Add-on</strong> untuk menambahkan opsi (misal: Tanpa Laminasi, Laminasi Glossy, dsb).
                </td>
              </tr>
            ) : (
              addons.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50/80">
                  <td className="px-6 py-4 font-mono text-xs text-slate-400">
                    #{a.display_order}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-800">{a.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-bold ${
                      a.price_flat === 0
                        ? "bg-slate-100 text-slate-600"
                        : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    }`}>
                      {a.price_flat === 0 ? "Gratis (+Rp 0)" : `+${formatCurrency(a.price_flat)} / pcs`}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500 max-w-xs">
                    {a.description || "—"}
                  </td>
                  <td className="px-6 py-4">
                    {a.is_default ? (
                      <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700 border border-amber-200">
                        ★ Default
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => handleEdit(a)}
                      className="rounded-lg px-2.5 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-50 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(a)}
                      disabled={deletingId === a.id}
                      className="rounded-lg px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 transition disabled:opacity-50"
                    >
                      {deletingId === a.id ? "..." : "Hapus"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AddonFormModal
        productId={product.id}
        addon={selectedAddon}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}
