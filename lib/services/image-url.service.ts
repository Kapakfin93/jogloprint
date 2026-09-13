/**
 * Pure client-safe Cloudinary URL transformations
 * Zero Node.js SDK dependencies (safe for browser & server)
 */

export function getOptimizedImageUrl(
  url: string,
  options: {
    width?: number;
    height?: number;
    crop?: "fill" | "limit" | "scale" | "thumb";
    quality?: "auto" | number;
  } = {}
): string {
  if (!url || !url.includes("cloudinary.com")) return url;

  const { width = 800, height, crop = "limit", quality = "auto" } = options;
  const transforms = [`f_auto`, `q_${quality}`, `c_${crop}`, `w_${width}`];
  if (height) transforms.push(`h_${height}`);

  const transformString = transforms.join(",");
  return url.replace("/upload/", `/upload/${transformString}/`);
}

export function getThumbnailUrl(url: string, size = 400): string {
  return getOptimizedImageUrl(url, { width: size, height: size, crop: "fill" });
}

export function getGalleryUrl(url: string, maxWidth = 1200): string {
  return getOptimizedImageUrl(url, { width: maxWidth, crop: "limit" });
}
