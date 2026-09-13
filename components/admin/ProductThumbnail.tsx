"use client";

import { useState } from "react";
import { getThumbnailUrl } from "@/lib/services/image-url.service";

interface ProductThumbnailProps {
  readonly src?: string | null;
  readonly alt: string;
}

export default function ProductThumbnail({ src, alt }: ProductThumbnailProps) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div className="h-12 w-12 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-medium text-slate-400 select-none">
        No Img
      </div>
    );
  }

  return (
    <img
      src={getThumbnailUrl(src, 80)}
      alt={alt}
      onError={() => setHasError(true)}
      className="h-12 w-12 rounded-lg object-cover border border-slate-200"
    />
  );
}
