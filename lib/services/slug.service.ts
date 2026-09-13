/**
 * Generate clean URL-friendly slug from text
 * Example: "Stiker & Label Kemasan" -> "stiker-label-kemasan"
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replaceAll("&", "dan")
    .replace(/[^\w\s-]+/g, "")
    .replace(/\s+/g, "-")
    .replace(/^-+|-+$/g, "");
}
