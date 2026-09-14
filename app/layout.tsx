import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import OrderListClientWrapper from "@/components/public/OrderListClientWrapper";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#d97706",
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://jogloweb.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Joglo Print Demak — Percetakan Digital, Stiker & Offset",
    template: "%s | Joglo Print Demak",
  },
  description:
    "Pusat cetak stiker kemasan, banner spanduk outdoor, poster A2-A0, digital print A3+ & print dokumen hitam putih cepat dan berkualitas di Demak.",
  keywords: [
    "percetakan demak",
    "cetak banner demak",
    "cetak stiker demak",
    "digital print a3 demak",
    "print dokumen a3 demak",
    "cetak poster demak",
    "joglo print",
  ],
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: siteUrl,
    siteName: "Joglo Print Demak",
    title: "Joglo Print Demak — Percetakan Digital, Stiker & Offset",
    description:
      "Pusat cetak stiker, banner/MMT, digital print A3+, poster & merchandise cepat dan berkualitas di Demak.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              additionalType: "https://schema.org/PrintingService",
              name: "Joglo Print Demak",
              description:
                "Pusat cetak stiker kemasan, banner outdoor, poster A2-A0, digital print A3+ & print dokumen hitam putih cepat dan berkualitas di Demak.",
              url: siteUrl,
              telephone: "+6281390286826",
              priceRange: "Rp 1.000 - Rp 500.000",
              address: {
                "@type": "PostalAddress",
                addressLocality: "Demak",
                addressRegion: "Jawa Tengah",
                addressCountry: "ID",
              },
            }),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 selection:bg-amber-500 selection:text-white">
        <OrderListClientWrapper>
          {children}
        </OrderListClientWrapper>
      </body>
    </html>
  );
}
