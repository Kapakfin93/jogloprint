"use client";

import { ProductSpecificationItem } from "@/lib/types/database";

interface ProductSpecificationEditorProps {
  readonly items: ProductSpecificationItem[];
  readonly onChange: (items: ProductSpecificationItem[]) => void;
}

export default function ProductSpecificationEditor({
  items,
  onChange,
}: ProductSpecificationEditorProps) {
  const safeItems = Array.isArray(items) ? items : [];

  function handleAddRow() {
    onChange([...safeItems, { label: "", value: "" }]);
  }

  function handleRemoveRow(index: number) {
    onChange(safeItems.filter((_, i) => i !== index));
  }

  function handleChange(index: number, field: "label" | "value", text: string) {
    const next = safeItems.map((item, i) => {
      if (i === index) {
        return { ...item, [field]: text };
      }
      return item;
    });
    onChange(next);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
          Spesifikasi Produk (Generik)
        </label>
        <button
          type="button"
          onClick={handleAddRow}
          className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition"
        >
          + Tambah Baris
        </button>
      </div>

      {safeItems.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 p-4 text-center text-xs text-slate-400">
          Belum ada spesifikasi. Klik tombol <strong>+ Tambah Baris</strong> (misal: Bahan, Mesin Cetak, Area Cetak).
        </div>
      ) : (
        <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
          {safeItems.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Label (contoh: Bahan)"
                value={item.label}
                onChange={(e) => handleChange(idx, "label", e.target.value)}
                className="w-1/3 rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 focus:border-amber-500 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Nilai (contoh: Kromo Glossy 140gsm)"
                value={item.value}
                onChange={(e) => handleChange(idx, "value", e.target.value)}
                className="flex-1 rounded-xl border border-slate-300 px-3 py-1.5 text-xs text-slate-700 focus:border-amber-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => handleRemoveRow(idx)}
                className="rounded-lg p-1.5 text-xs text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
                title="Hapus baris"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
