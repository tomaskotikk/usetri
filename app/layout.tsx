import type { Metadata } from "next";
import { Bricolage_Grotesque, IBM_Plex_Mono, Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "variable",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-num",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const DESCRIPTION =
  "Spoj se s lidmi, rozdělte si oficiální rodinná předplatná Spotify, Netflix, Disney+ a dalších a plať jen svůj podíl.";

/**
 * Canonical and Open Graph URLs are resolved against this, so a missing value
 * would silently publish links to localhost. Preview deployments can override it.
 */
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://usetri.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Ušetři — plať jen svůj podíl",
    template: "%s — Ušetři",
  },
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "cs_CZ",
    url: "/",
    siteName: "Ušetři",
    title: "Ušetři — plať jen svůj podíl",
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "Ušetři — plať jen svůj podíl",
    description: DESCRIPTION,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="cs"
      className={`${jakarta.variable} ${bricolage.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col overflow-x-hidden">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
