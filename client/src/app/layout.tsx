import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import { Toaster } from "@/components/ui/sonner";
import "sonner/dist/styles.css"; 

export const metadata: Metadata = {
  title: "Nestopia - Find Your Dream Home",
  description: "Apartment rental system for renters and rentees.",
  keywords: ["house rental", "apartments", "real estate", "Nestopia"],
  authors: [{ name: "Ezira Tigab" }],
  openGraph: {
    title: "Nestopia - Find Your Dream Home",
    description: "Discover the best rental houses and apartments with Nestopia.",
    url: "https://nestopia-five.vercel.app",
    siteName: "Nestopia",
    images: [
      {
        url: "https://nestopia-five.vercel.app/logo.png",
        width: 1200,
        height: 630,
        alt: "Nestopia - Find Your Dream Home",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nestopia - Find Your Dream Home",
    description: "Browse top rental listings at Nestopia today!",
    images: ["https://nestopia-five.vercel.app/preview-image.jpg"],
  },
  other: {
    "og:see_also": "https://t.me/ezirawi", // ✅ Telegram Profile Link
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
        <Toaster closeButton />
      </body>
    </html>
  );
}
