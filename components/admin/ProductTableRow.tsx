"use client";

import { ProductWithDetails } from "@/lib/repositories/products.repository";
import ProductThumbnail from "./ProductThumbnail";
import Link from "next/link";

interface ProductTableRowProps {
  readonly prod: ProductWithDetails;
  readonly isProdActive: boolean;
  readonly isToggling: boolean;
  readonly isDeleting: boolean;
  readonly onToggleActive: (prodId: string, currentStatus: boolean) => void;
  readonly onDuplicate: (prod: ProductWithDetails) => void;
  readonly onEdit: (prod: ProductWithDetails) => void;
  readonly onDelete: (prod: ProductWithDetails) => void;
}

export default function ProductTableRow({
  prod,
  isProdActive,
  isToggling,
  isDeleting,
  onToggleActive,
  onDuplicate,
  onEdit,
  onDelete,
}: ProductTableRowProps) {
  return (
    <tr className="hover:bg-slate-50/80">
      <td className="px-6 py-3">
        <ProductThumbnail src={prod.primary_image_url} alt={prod.name} />
      </td>
      <td className="px-6 py-4">
        <div className="font-bold text-slate-800">{prod.name}</div>
        <div className="text-xs font-mono text-slate-400">/{prod.slug}</div>
      </td>
      <td className="px-6 py-4">
        <div className="flex flex-col gap-1">
          <span className="font-semibold text-slate-700">{prod.category_name || "—"}</span>
          <span className="inline-block w-fit rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-700 border border-amber-200">
            {prod.pricing_model === "meter_lari" && "📏 Meter Lari"}
            {prod.pricing_model === "area" && "📐 Luas Area (m²)"}
            {prod.pricing_model === "bundle" && "📚 Paket/Buku"}
            {(!prod.pricing_model || prod.pricing_model === "sheet") && "📄 Lembaran/Pcs"}
          </span>
        </div>
      </td>
      <td className="px-6 py-4 text-xs font-bold text-slate-700">
        {prod.unit_label || "lembar"}
      </td>
      <td className="px-6 py-4">
        <button
          type="button"
          onClick={() => onToggleActive(prod.id, isProdActive)}
          disabled={isToggling}
          title={isProdActive ? "Klik untuk sembunyikan dari katalog publik" : "Klik untuk tampilkan di katalog publik"}
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition shadow-2xs cursor-pointer ${
            isProdActive
              ? "bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100"
              : "bg-slate-100 text-slate-500 border border-slate-300 hover:bg-slate-200"
          } disabled:opacity-50`}
        >
          <span className={`h-2 w-2 rounded-full ${isProdActive ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
          <span>{isProdActive ? "Aktif" : "Sembunyi"}</span>
        </button>
      </td>
      <td className="px-6 py-4 text-right space-x-1">
        {isProdActive ? (
          <a
            href={`/produk/${prod.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg px-2 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition inline-flex items-center gap-0.5"
            title="Buka halaman publik produk ini di tab baru"
          >
            <span>Lihat</span>
            <span className="text-[10px]">↗</span>
          </a>
        ) : (
          <button
            type="button"
            onClick={() =>
              alert("Produk saat ini berstatus Sembunyi. Aktifkan status publik produk terlebih dahulu untuk membuka halaman publik.")
            }
            className="rounded-lg px-2 py-1 text-xs font-semibold text-slate-400 hover:bg-slate-100 transition cursor-help"
            title="Produk sedang disembunyikan. Aktifkan status publik untuk melihat halaman publik"
          >
            Lihat ↗
          </button>
        )}
        <Link
          href={`/admin/produk/${prod.id}/varian`}
          className="rounded-lg px-2 py-1 text-xs font-semibold bg-amber-50 text-amber-700 hover:bg-amber-100 transition"
        >
          Varian
        </Link>
        <Link
          href={`/admin/produk/${prod.id}/addon`}
          className="rounded-lg px-2 py-1 text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
        >
          Add-on
        </Link>
        <button
          onClick={() => onDuplicate(prod)}
          title="Duplikat produk dengan nama dan slug baru"
          className="rounded-lg px-2 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 transition"
        >
          Duplikat
        </button>
        <button
          onClick={() => onEdit(prod)}
          className="rounded-lg px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(prod)}
          disabled={isDeleting}
          className="rounded-lg px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 transition disabled:opacity-50"
        >
          {isDeleting ? "..." : "Hapus"}
        </button>
      </td>
    </tr>
  );
}
