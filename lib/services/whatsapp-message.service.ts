import { formatCurrency } from "./pricing.service";

export const DEFAULT_WHATSAPP_NUMBER = "6281390286826";

export interface SelectedAddonParam {
  name: string;
  price_flat?: number;
}

export interface OrderMessageParams {
  productName: string;
  variantName: string;
  addonName: string;
  addonPrice: number;
  selectedAddons?: readonly SelectedAddonParam[];
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
  needsSeam?: boolean;
}

export interface MultiOrderItemParam extends Omit<OrderMessageParams, "grandTotal"> {
  subtotal: number;
}

function resolveDefaultUnit(model?: string): string {
  if (model === "area") return "m²";
  if (model === "meter_lari") return "meter";
  if (model === "bundle") return "buku";
  return "lembar";
}

function formatAreaItemLines(params: OrderMessageParams, addonText: string): string[] {
  const areaUnitStr = params.billedAreaM2 && params.billedAreaM2 !== params.rawAreaM2
    ? `${params.rawAreaM2?.toFixed(2)} m² (Min hitung ${params.billedAreaM2.toFixed(1)} m²)`
    : `${params.rawAreaM2?.toFixed(2)} m²`;

  const lines = [`Ukuran: ${params.lengthCm} cm x ${params.widthCm} cm (${areaUnitStr})`];
  if (params.needsSeam) {
    lines.push("Catatan: Ukuran melebihi lebar roll 150 cm (perlu sambungan)");
  }
  lines.push(
    `Finishing: ${params.variantName}`,
    `Opsi Tambahan: ${params.addonName} (${addonText})`,
    params.unitPrice ? `Harga Bahan: ${formatCurrency(params.unitPrice)} / m²` : "",
    `Jumlah: ${params.qty} pcs`,
    `Estimasi Total: ${formatCurrency(params.totalPerUnit)} / pcs x ${params.qty} pcs = ${formatCurrency(params.grandTotal)}`
  );
  return lines;
}

function formatSingleItemLines(params: OrderMessageParams, addonText: string, safeUnit: string): string[] {
  if (params.pricingModel === "area" && params.lengthCm && params.widthCm) {
    return formatAreaItemLines(params, addonText);
  }

  if (params.pricingModel === "meter_lari") {
    return [
      `Lebar Bahan: ${params.variantName}`,
      `Panjang: ${params.qty} meter`,
      `Finishing: ${params.addonName} (${addonText})`,
      params.unitPrice ? `Harga Satuan: ${formatCurrency(params.unitPrice)} / meter` : "",
      `Jumlah: ${params.qty} meter`,
      `Estimasi Total: ${formatCurrency(params.totalPerUnit)} / meter x ${params.qty} = ${formatCurrency(params.grandTotal)}`
    ];
  }

  if (params.pricingModel === "bundle") {
    return [
      `Varian: ${params.variantName}`,
      `Opsi Tambahan: ${params.addonName} (${addonText})`,
      params.unitPrice ? `Harga Satuan: ${formatCurrency(params.unitPrice)} / ${safeUnit}` : "",
      `Jumlah: ${params.qty} ${safeUnit}`,
      `Estimasi Total: ${formatCurrency(params.totalPerUnit)} / ${safeUnit} x ${params.qty} = ${formatCurrency(params.grandTotal)}`
    ];
  }

  let addonLines: string[];
  if (params.selectedAddons && params.selectedAddons.length > 1) {
    addonLines = [
      `Opsi Tambahan (${params.selectedAddons.length} opsi terpilih):`,
      ...params.selectedAddons.map((a) => {
        const itemPrice = (a.price_flat || 0) === 0 ? "Bawaan / Rp 0" : `+${formatCurrency(a.price_flat || 0)}`;
        return `  - ${a.name} (${itemPrice}/${safeUnit})`;
      }),
      `Total Tambahan: +${formatCurrency(params.addonPrice)} / ${safeUnit}`,
    ];
  } else {
    const isLaminate = params.productName.toLowerCase().includes("stiker") || params.addonName.toLowerCase().includes("laminasi");
    const label = isLaminate ? "Laminasi" : "Opsi Tambahan";
    addonLines = [`${label}: ${params.addonName} (${addonText}/${safeUnit})`];
  }

  return [
    `Finishing: ${params.variantName}`,
    ...addonLines,
    params.unitPrice ? `Harga Satuan: ${formatCurrency(params.unitPrice)} / ${safeUnit}` : "",
    `Jumlah: ${params.qty} ${safeUnit}`,
    `Estimasi Total: ${formatCurrency(params.totalPerUnit)} / ${safeUnit} x ${params.qty} = ${formatCurrency(params.grandTotal)}`
  ];
}

/**
 * Generate formatted structured WhatsApp order message for single product
 */
export function generateOrderMessage(params: OrderMessageParams): string {
  const safeUnit = params.unitLabel?.trim() || resolveDefaultUnit(params.pricingModel);
  const addonText = params.addonPrice === 0 ? "Tanpa tambahan" : `+${formatCurrency(params.addonPrice)}`;

  const lines = [
    "Halo Joglo Print, saya ingin memesan:",
    "",
    `Produk: ${params.productName}`,
    ...formatSingleItemLines(params, addonText, safeUnit),
    "",
    `Link Produk: ${params.productUrl}`,
    "",
    "Mohon info ketersediaan & konfirmasi pesanan. Terima kasih!"
  ];

  return lines.filter((l) => l !== "").join("\n");
}

function formatMultiItemLines(item: MultiOrderItemParam, addonText: string, safeUnit: string): string[] {
  if (item.pricingModel === "area" && item.lengthCm && item.widthCm) {
    const areaStr = item.billedAreaM2 && item.billedAreaM2 !== item.rawAreaM2
      ? `${item.rawAreaM2?.toFixed(2)} m² (Min ${item.billedAreaM2.toFixed(1)} m²)`
      : `${item.rawAreaM2?.toFixed(2)} m²`;
    const lines = [`• Ukuran: ${item.lengthCm}cm x ${item.widthCm}cm (${areaStr})`];
    if (item.needsSeam) lines.push("• Catatan: Ukuran melebihi lebar roll 150 cm (perlu sambungan)");
    lines.push(`• Finishing: ${item.variantName}`, `• Opsi: ${item.addonName} (${addonText})`, `• Jumlah: ${item.qty} pcs`);
    return lines;
  }

  if (item.pricingModel === "meter_lari") {
    return [
      `• Bahan/Lebar: ${item.variantName}`,
      `• Finishing: ${item.addonName} (${addonText})`,
      `• Panjang: ${item.qty} meter`
    ];
  }

  const isLaminate = item.productName.toLowerCase().includes("stiker") || item.addonName.toLowerCase().includes("laminasi");
  const addonLabel = isLaminate ? "Laminasi" : "Opsi Tambahan";

  const addonDisplay = item.selectedAddons && item.selectedAddons.length > 1
    ? item.selectedAddons.map((a) => `${a.name} (+${formatCurrency(a.price_flat || 0)})`).join(", ")
    : item.addonName;

  const addonLine = item.selectedAddons && item.selectedAddons.length > 1
    ? `• ${addonLabel}: ${addonDisplay} (Total: +${formatCurrency(item.addonPrice)})`
    : `• ${addonLabel}: ${addonDisplay} (${addonText})`;

  return [
    `• Finishing/Varian: ${item.variantName}`,
    addonLine,
    `• Jumlah: ${item.qty} ${safeUnit}`
  ];
}

/**
 * Generate formatted multi-item WhatsApp order message from Drawer Cart
 */
export function generateMultiItemOrderMessage(items: MultiOrderItemParam[]): string {
  if (items.length === 0) {
    return "Halo Joglo Print, saya ingin konsultasi pesanan cetak.";
  }

  const grandTotal = items.reduce((sum, it) => sum + it.subtotal, 0);
  const lines: string[] = [
    `Halo Joglo Print, saya ingin memesan *${items.length} item* produk berikut:`,
    "",
  ];

  items.forEach((item, idx) => {
    const safeUnit = item.unitLabel?.trim() || resolveDefaultUnit(item.pricingModel);
    const addonText = item.addonPrice === 0 ? "Tanpa tambahan" : `+${formatCurrency(item.addonPrice)}`;

    lines.push(
      `*ITEM #${idx + 1}: ${item.productName}*`,
      ...formatMultiItemLines(item, addonText, safeUnit),
      `• Subtotal: ${formatCurrency(item.subtotal)}`,
      `• Link: ${item.productUrl}`,
      "------------------------------------"
    );
  });

  lines.push(
    `*TOTAL KESELURUHAN (${items.length} ITEM): ${formatCurrency(grandTotal)}*`,
    "====================================",
    "",
    "Mohon konfirmasi ketersediaan & total rincian order ini. Terima kasih!"
  );

  return lines.join("\n");
}

/**
 * Clean phone number and generate full wa.me link
 */
export function generateWhatsAppUrl(whatsappNumber: string, message: string): string {
  let cleanNumber = whatsappNumber.replace(/\D/g, "");
  if (cleanNumber.startsWith("08")) {
    cleanNumber = "62" + cleanNumber.slice(1);
  } else if (!cleanNumber.startsWith("62") && cleanNumber.length > 0) {
    cleanNumber = "62" + cleanNumber;
  }
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}
