import React from "react";

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function BreadcrumbJsonLd({ items }: { readonly items: readonly BreadcrumbItem[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export interface ProductJsonLdProps {
  readonly name: string;
  readonly description: string | null;
  readonly url: string;
  readonly imageUrl?: string | null;
  readonly price: number | null;
  readonly currency?: string;
  readonly categoryName?: string;
}

export function ProductJsonLd({
  name,
  description,
  url,
  imageUrl,
  price,
  currency = "IDR",
  categoryName,
}: ProductJsonLdProps) {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description: description || `Pesan cetak ${name} berkualitas di Joglo Print Demak.`,
    url,
    brand: {
      "@type": "Brand",
      name: "Joglo Print",
    },
    ...(categoryName ? { category: categoryName } : {}),
    ...(imageUrl ? { image: [imageUrl] } : {}),
    offers: {
      "@type": "Offer",
      price: price || 0,
      priceCurrency: currency,
      availability: "https://schema.org/InStock",
      url,
      seller: {
        "@type": "Organization",
        name: "Joglo Print Demak",
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function OrganizationJsonLd({
  siteUrl,
  whatsappNumber,
}: {
  readonly siteUrl: string;
  readonly whatsappNumber?: string;
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    additionalType: "https://schema.org/PrintingService",
    name: "Joglo Print Demak",
    description:
      "Pusat cetak stiker kemasan, banner spanduk outdoor, poster A2-A0, digital print A3+ & print dokumen hitam putih cepat dan berkualitas di Demak.",
    url: siteUrl,
    telephone: whatsappNumber ? `+${whatsappNumber}` : "+6281390286826",
    priceRange: "Rp 1.000 - Rp 500.000",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Demak",
      addressRegion: "Jawa Tengah",
      addressCountry: "ID",
    },
    areaServed: ["Demak", "Semarang", "Kudus", "Jepara", "Grobogan"],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
