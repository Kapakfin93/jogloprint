"use client";

import { useState } from "react";
import { ProductWithDetails } from "@/lib/repositories/products.repository";
import { VariantWithTiers } from "@/lib/repositories/variants.repository";
import { deleteVariantAction } from "@/app/admin/actions/variants.action";
import { formatCurrency } from "@/lib/services/pricing.service";
import VariantFormModal from "./VariantFormModal";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface VariantManagerProps {
  readonly product: ProductWithDetails;
  readonly variants: VariantWithTiers[];
}

export default function VariantManager({ product, variants }: VariantManagerProps) {
  const router = useRouter();
  const [selectedVariant, setSelectedVariant] = useState<VariantWithTiers | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function handleAdd() {
    setSelectedVariant(null);
    setIsModalOpen(true);
  }

  function handleEdit(v: VariantWithTiers) {
    setSelectedVariant(v);
    setIsModalOpen(true);
  }

  async function handleDelete(v: VariantWithTiers) {
    if (!confirm(`Hapus varian finishing "${v.variant_name}"? Tabel tier harga di dalamnya akan ikut terhapus.`)) {
      return;
    }

    setDeletingId(v.id);
    const result = await deleteVariantAction(product.id, v.id);
    setDeletingId(null);

    if (!result.success) {
      alert(result.error || "Gagal menghapus varian");
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
              Varian Finishing & Tier Harga
            </h1>
            <p className="text-sm text-slate-500">
              Produk: <strong className="text-slate-800">{product.name}</strong> ({product.category_name})
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/admin/produk/${product.id}/addon`}
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
            >
              Ke Add-on (Laminasi) →
            </Link>
            <button
              onClick={handleAdd}
              className="rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-amber-700 transition"
            >
              + Tambah Varian Finishing
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase border-b border-slate-200">
            <tr>
              <th className="px-6 py-3.5">Urutan</th>
              <th className="px-6 py-3.5">Nama Finishing</th>
              <th className="px-6 py-3.5">Keterangan</th>
              <th className="px-6 py-3.5">Tabel Tier Harga</th>
              <th className="px-6 py-3.5">Default</th>
              <th className="px-6 py-3.5 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {variants.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                  Belum ada varian finishing. Klik <strong>+ Tambah Varian Finishing</strong> untuk menambah varian (contoh: Kiss Cut, Die Cut, Tanpa Potong, dsb).
                </td>
              </tr>
            ) : (
              variants.map((v) => {
                const tiers = v.price_tiers || [];
                const lowest = tiers[tiers.length - 1];
                const highest = tiers[0];

                return (
                  <tr key={v.id} className="hover:bg-slate-50/80">
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">
                      #{v.display_order}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800">{v.variant_name}</div>
                      {v.sku && <div className="text-[11px] font-mono text-slate-400">SKU: {v.sku}</div>}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 max-w-xs">
                      {v.description || "—"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs font-semibold text-slate-800">
                        {tiers.length} Tier
                        {lowest && highest && (
                          <span className="text-slate-500 font-normal ml-1">
                            ({formatCurrency(lowest.price_per_unit)} – {formatCurrency(highest.price_per_unit)})
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {tiers.map((t) => `${t.min_qty}${t.max_qty ? `-${t.max_qty}` : "+"}: ${formatCurrency(t.price_per_unit)}`).join(" | ")}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {v.is_default ? (
                        <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700 border border-amber-200">
                          ★ Default
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleEdit(v)}
                        className="rounded-lg px-2.5 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-50 transition"
                      >
                        Edit & Tier
                      </button>
                      <button
                        onClick={() => handleDelete(v)}
                        disabled={deletingId === v.id}
                        className="rounded-lg px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 transition disabled:opacity-50"
                      >
                        {deletingId === v.id ? "..." : "Hapus"}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <VariantFormModal
        productId={product.id}
        variant={selectedVariant}
        pricingModel={product.pricing_model}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}
