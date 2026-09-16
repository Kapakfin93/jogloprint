"use client";

import { useState } from "react";
import { uploadImageAction } from "@/app/actions/upload.action";
import { getThumbnailUrl } from "@/lib/services/image-url.service";

export interface FormImageItem {
  id?: string;
  image_url: string;
  alt_text?: string;
  is_primary: boolean;
  display_order: number;
  file_hash?: string | null;
  duplicate_warning?: string | null;
}

interface ProductImageUploaderProps {
  readonly images: FormImageItem[];
  readonly onChange: (images: FormImageItem[]) => void;
}

export default function ProductImageUploader({
  images,
  onChange,
}: ProductImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);
    const newWarnings: string[] = [];

    try {
      const newImages: FormImageItem[] = [...images];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", "products");

        const result = await uploadImageAction(formData);
        if (!result.success || !result.data) {
          throw new Error(result.error || "Gagal mengunggah foto");
        }

        if (result.duplicate_warning) {
          newWarnings.push(`"${file.name}": ${result.duplicate_warning}`);
        }

        const isFirst = newImages.length === 0;
        newImages.push({
          image_url: result.data.secure_url,
          alt_text: file.name.split(".")[0],
          is_primary: isFirst,
          display_order: newImages.length,
          file_hash: result.file_hash || null,
          duplicate_warning: result.duplicate_warning || null,
        });
      }

      setWarnings((prev) => [...prev, ...newWarnings]);
      onChange(newImages);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal upload");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function handleSetPrimary(index: number) {
    const updated = images.map((img, i) => ({
      ...img,
      is_primary: i === index,
    }));
    onChange(updated);
  }

  function handleRemove(index: number) {
    const remaining = images.filter((_, i) => i !== index);
    if (remaining.length > 0 && !remaining.some((img) => img.is_primary)) {
      remaining[0].is_primary = true;
    }
    onChange(remaining);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
          Foto Produk (Cloudinary Multi-Upload)
        </label>
        <label className="cursor-pointer rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-100 transition border border-amber-200">
          {uploading ? "Mengunggah..." : "+ Pilih Foto"}
          <input
            type="file"
            multiple
            accept="image/*"
            disabled={uploading}
            onChange={handleFileSelect}
            className="hidden"
          />
        </label>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 p-2 text-xs text-red-600 border border-red-200">
          {error}
        </div>
      )}

      {warnings.length > 0 && (
        <div className="rounded-xl bg-amber-50 p-2.5 text-xs text-amber-800 border border-amber-300 space-y-1">
          <div className="font-bold flex items-center gap-1 text-amber-900">
            <span>⚠️</span> Peringatan Duplikasi Foto:
          </div>
          {warnings.map((w, idx) => (
            <div key={idx} className="pl-4 text-[11px] leading-tight text-amber-800">
              • {w}
            </div>
          ))}
        </div>
      )}

      {images.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 p-4 text-center text-xs text-slate-400">
          Belum ada foto produk. Klik <strong>+ Pilih Foto</strong> untuk upload foto dari komputer.
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-2.5">
          {images.map((img, idx) => (
            <div
              key={idx}
              className={`group relative rounded-xl border p-1 overflow-hidden transition ${
                img.is_primary
                  ? "border-amber-500 bg-amber-50/30 ring-2 ring-amber-400"
                  : "border-slate-200 bg-slate-50"
              }`}
            >
              <img
                src={getThumbnailUrl(img.image_url, 150)}
                alt={img.alt_text || "Foto Produk"}
                className="h-20 w-full rounded-lg object-cover"
              />
              {img.duplicate_warning && (
                <div
                  className="absolute top-1 right-1 bg-amber-500 text-white rounded-full p-0.5 px-1.5 text-[9px] font-bold shadow-xs cursor-help"
                  title={img.duplicate_warning}
                >
                  ⚠️ Duplikat
                </div>
              )}
              <div className="mt-1 flex items-center justify-between px-1">
                <button
                  type="button"
                  onClick={() => handleSetPrimary(idx)}
                  className={`text-[10px] font-bold ${
                    img.is_primary ? "text-amber-600" : "text-slate-400 hover:text-slate-700"
                  }`}
                >
                  {img.is_primary ? "★ Utama" : "Set Utama"}
                </button>
                <button
                  type="button"
                  onClick={() => handleRemove(idx)}
                  className="text-[10px] text-red-500 hover:text-red-700 font-bold"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

