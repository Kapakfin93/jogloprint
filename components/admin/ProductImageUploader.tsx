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
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);

  const MAX_TOTAL_IMAGES = 10;
  const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
  const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setError(null);

    // 1. Validasi Total Jumlah Foto (Max 10)
    if (images.length + files.length > MAX_TOTAL_IMAGES) {
      setError(
        `Maksimal ${MAX_TOTAL_IMAGES} foto per produk. Saat ini sudah ada ${images.length} foto, Anda mencoba menambah ${files.length} foto lagi.`
      );
      e.target.value = "";
      return;
    }

    // 2. Validasi Format dan Ukuran Setiap File
    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
        setError(
          `Format file "${file.name}" (${file.type || "tidak dikenal"}) tidak didukung. Harap gunakan format JPG, PNG, atau WebP.`
        );
        e.target.value = "";
        return;
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
        setError(
          `Ukuran file "${file.name}" (${sizeMb} MB) melebihi batas maksimal 10 MB. Silakan kompres foto sebelum mengunggah.`
        );
        e.target.value = "";
        return;
      }
    }

    setUploading(true);
    const newWarnings: string[] = [];
    const newImages: FormImageItem[] = [...images];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadStatus(`Mengunggah foto ${i + 1} dari ${files.length} (${file.name})...`);

        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", "products");

        let result;
        try {
          result = await uploadImageAction(formData);
        } catch (fetchErr: unknown) {
          const rawMsg = fetchErr instanceof Error ? fetchErr.message : String(fetchErr);
          if (rawMsg.toLowerCase().includes("failed to fetch")) {
            throw new Error(
              `Koneksi terputus saat mengunggah "${file.name}". Ukuran file kemungkinan melebihi batas request server (maks. 10MB) atau jaringan terganggu. Silakan periksa koneksi Anda.`
            );
          }
          throw new Error(`Gagal mengunggah "${file.name}": ${rawMsg}`);
        }

        if (!result.success || !result.data) {
          throw new Error(result.error || `Gagal mengunggah "${file.name}"`);
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

        // Update parsial state agar foto yang berhasil tetap tersimpan walau loop terinterupsi
        onChange([...newImages]);
      }

      setWarnings((prev) => [...prev, ...newWarnings]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan saat mengunggah foto");
    } finally {
      setUploading(false);
      setUploadStatus(null);
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
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Foto Produk (Cloudinary Multi-Upload)
          </label>
          <span className="text-[10px] text-slate-500 block">
            Format: JPG, PNG, WebP • Maks. 10MB/file • Maks. {MAX_TOTAL_IMAGES} foto
          </span>
        </div>
        <label className="cursor-pointer rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-100 transition border border-amber-200">
          {uploading ? "Mengunggah..." : "+ Pilih Foto"}
          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/jpg"
            disabled={uploading}
            onChange={handleFileSelect}
            className="hidden"
          />
        </label>
      </div>

      {uploadStatus && (
        <div className="rounded-xl bg-blue-50 p-2 text-xs text-blue-700 border border-blue-200 flex items-center gap-2">
          <span className="animate-spin text-sm">⏳</span>
          <span>{uploadStatus}</span>
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-red-50 p-2.5 text-xs text-red-600 border border-red-200 flex items-start justify-between gap-2">
          <div className="flex items-start gap-1.5">
            <span className="text-red-500 font-bold">⚠️</span>
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-700 font-bold text-xs"
            title="Tutup pesan"
          >
            ✕
          </button>
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

