import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { profile } from "@/content/profile";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono-fallback", display: "swap" });

/*
 * Without this, Open Graph image URLs resolve against localhost and every
 * link preview breaks once the site is shared. Vercel supplies the
 * production host; set NEXT_PUBLIC_SITE_URL to override it for a custom
 * domain.
 */
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

const title = `${profile.name} — ${profile.role}`;
const description = profile.tagline;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  applicationName: `${profile.name} OS`,
  authors: [{ name: profile.name }],
  keywords: [profile.name, "finance", "CMA", "financial analysis", "equity research", "Chennai", "portfolio"],
  openGraph: { title, description, type: "website", siteName: profile.name },
  twitter: { card: "summary_large_image", title, description },
};

export const viewport: Viewport = {
  themeColor: "#0b0d14",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-appearance="dark" suppressHydrationWarning>
      <head>
        {/* applied before first paint so a saved theme or wallpaper never flashes */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var d=document.documentElement,a=localStorage.getItem("appearance");if(a==="light"||a==="dark")d.setAttribute("data-appearance",a);var w=localStorage.getItem("wallpaper");if(w&&/^[a-z]+$/.test(w))d.setAttribute("data-wallpaper",w)}catch(e){}`,
          }}
        />
      </head>
      <body className={`${inter.variable} ${mono.variable} antialiased`}>{children}</body>
    </html>
  );
}
