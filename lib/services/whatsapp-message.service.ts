import { formatCurrency } from "./pricing.service";

export interface OrderMessageParams {
  productName: string;
  variantName: string;
  addonName: string;
  addonPrice: number;
  unitPrice?: number;
  qty: number;
  unitLabel?: string | null;
  totalPerUnit: number;
  grandTotal: number;
  productUrl: string;
  pricingModel?: string;
  lengthCm?: number;
  widthCm?: number;
  lengthM?: number;
  rawAreaM2?: number;
  billedAreaM2?: number;
}

/**
 * Generate formatted structured WhatsApp order message (Layer 2 - Pure Logic)
 */
export function generateOrderMessage(params: OrderMessageParams): string {
  const isArea = params.pricingModel === "area" && params.lengthCm && params.widthCm;
  const isMeterLari = params.pricingModel === "meter_lari";
  const isBundle = params.pricingModel === "bundle";
  
  let defaultUnit = "lembar";
  if (isArea) defaultUnit = "m²";
  else if (isMeterLari) defaultUnit = "meter";
  else if (isBundle) defaultUnit = "buku";
  const safeUnit = params.unitLabel?.trim() || defaultUnit;

  const addonPriceText =
    params.addonPrice === 0
      ? "Tanpa biaya tambahan"
      : `+${formatCurrency(params.addonPrice)}`;

  const lines = [
    "Halo Joglo Print, saya ingin memesan:",
    "",
    `Produk: ${params.productName}`,
  ];

  if (isArea) {
    const areaUnitStr = params.billedAreaM2 && params.billedAreaM2 !== params.rawAreaM2
      ? `${params.rawAreaM2?.toFixed(2)} m² (Min hitung ${params.billedAreaM2.toFixed(1)} m²)`
      : `${params.rawAreaM2?.toFixed(2)} m²`;

    lines.push(
      `Ukuran: ${params.lengthCm} cm x ${params.widthCm} cm (${areaUnitStr})`,
      `Finishing: ${params.variantName}`,
      `Opsi Tambahan: ${params.addonName} (${addonPriceText})`,
      params.unitPrice ? `Harga Bahan: ${formatCurrency(params.unitPrice)} / m²` : "",
      `Jumlah: ${params.qty} pcs`,
      `Estimasi Total: ${formatCurrency(params.totalPerUnit)} / pcs x ${params.qty} pcs = ${formatCurrency(params.grandTotal)}`
    );
  } else if (isMeterLari) {
    lines.push(
      `Lebar Bahan: ${params.variantName}`,
      `Panjang: ${params.qty} meter`,
      `Finishing: ${params.addonName} (${addonPriceText})`,
      params.unitPrice ? `Harga Satuan: ${formatCurrency(params.unitPrice)} / meter` : "",
      `Jumlah: ${params.qty} meter`,
      `Estimasi Total: ${formatCurrency(params.totalPerUnit)} / meter x ${params.qty} = ${formatCurrency(params.grandTotal)}`
    );
  } else if (isBundle) {
    lines.push(
      `Varian: ${params.variantName}`,
      `Opsi Tambahan: ${params.addonName} (${addonPriceText})`,
      params.unitPrice ? `Harga Satuan: ${formatCurrency(params.unitPrice)} / ${safeUnit}` : "",
      `Jumlah: ${params.qty} ${safeUnit}`,
      `Estimasi Total: ${formatCurrency(params.totalPerUnit)} / ${safeUnit} x ${params.qty} = ${formatCurrency(params.grandTotal)}`
    );
  } else {
    lines.push(
      `Finishing: ${params.variantName}`,
      `Laminasi: ${params.addonName} (${addonPriceText}/${safeUnit})`,
      params.unitPrice ? `Harga Satuan: ${formatCurrency(params.unitPrice)} / ${safeUnit}` : "",
      `Jumlah: ${params.qty} ${safeUnit}`,
      `Estimasi Total: ${formatCurrency(params.totalPerUnit)} / ${safeUnit} x ${params.qty} = ${formatCurrency(params.grandTotal)}`
    );
  }

  // Filter out any empty lines pushed conditionally
  const cleanLines = lines.filter((l) => l !== "");

  cleanLines.push(
    "",
    `Link Produk: ${params.productUrl}`,
    "",
    "Mohon info ketersediaan & konfirmasi pesanan. Terima kasih!"
  );

  return cleanLines.join("\n");
}

/**
 * Clean phone number and generate full wa.me link
 */
export function generateWhatsAppUrl(
  whatsappNumber: string,
  message: string
): string {
  // Remove non-digit characters
  let cleanNumber = whatsappNumber.replace(/\D/g, "");

  // Convert leading '08' to '628'
  if (cleanNumber.startsWith("08")) {
    cleanNumber = "62" + cleanNumber.slice(1);
  } else if (!cleanNumber.startsWith("62") && cleanNumber.length > 0) {
    cleanNumber = "62" + cleanNumber;
  }

  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
}

/**
 * Generate formatted multi-item WhatsApp order message for Task 15
 */
export function generateMultiItemOrderMessage(
  items: Array<{
    productName: string;
    variantName: string;
    addonName: string;
    addonPrice: number;
    unitPrice?: number;
    qty: number;
    unitLabel?: string | null;
    totalPerUnit: number;
    subtotal: number;
    productUrl: string;
    pricingModel?: string;
    lengthCm?: number;
    widthCm?: number;
    rawAreaM2?: number;
    billedAreaM2?: number;
  }>
): string {
  if (items.length === 0) {
    return "Halo Joglo Print, saya ingin konsultasi pesanan cetak.";
  }

  const grandTotal = items.reduce((sum, it) => sum + it.subtotal, 0);
  const lines: string[] = [
    `Halo Joglo Print, saya ingin memesan *${items.length} item* produk berikut:`,
    "",
  ];

  items.forEach((item, idx) => {
    const isArea = item.pricingModel === "area" && item.lengthCm && item.widthCm;
    const isMeterLari = item.pricingModel === "meter_lari";
    const safeUnit = item.unitLabel?.trim() || (isArea ? "m²" : isMeterLari ? "meter" : "lembar");
    const addonPriceText =
      item.addonPrice === 0 ? "Tanpa tambahan" : `+${formatCurrency(item.addonPrice)}`;

    lines.push(`*ITEM #${idx + 1}: ${item.productName}*`);

    if (isArea) {
      const areaStr = item.billedAreaM2 && item.billedAreaM2 !== item.rawAreaM2
        ? `${item.rawAreaM2?.toFixed(2)} m² (Min ${item.billedAreaM2.toFixed(1)} m²)`
        : `${item.rawAreaM2?.toFixed(2)} m²`;
      lines.push(`• Ukuran: ${item.lengthCm}cm x ${item.widthCm}cm (${areaStr})`);
      lines.push(`• Finishing: ${item.variantName}`);
      lines.push(`• Opsi: ${item.addonName} (${addonPriceText})`);
      lines.push(`• Jumlah: ${item.qty} pcs`);
    } else if (isMeterLari) {
      lines.push(`• Bahan/Lebar: ${item.variantName}`);
      lines.push(`• Finishing: ${item.addonName} (${addonPriceText})`);
      lines.push(`• Panjang: ${item.qty} meter`);
    } else {
      lines.push(`• Finishing/Varian: ${item.variantName}`);
      lines.push(`• Laminasi/Addon: ${item.addonName} (${addonPriceText})`);
      lines.push(`• Jumlah: ${item.qty} ${safeUnit}`);
    }

    lines.push(`• Subtotal: ${formatCurrency(item.subtotal)}`);
    lines.push(`• Link: ${item.productUrl}`);
    lines.push("------------------------------------");
  });

  lines.push(
    `*TOTAL KESELURUHAN (${items.length} ITEM): ${formatCurrency(grandTotal)}*`,
    "====================================",
    "",
    "Mohon konfirmasi ketersediaan & total rincian order ini. Terima kasih!"
  );

  return lines.join("\n");
}

