import type { Metadata, Viewport } from "next";
import { Literata, Public_Sans } from "next/font/google";
import { BackgroundField } from "@/components/layout/BackgroundField";
import "./globals.css";

const literata = Literata({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  variable: "--font-literata",
  display: "swap",
});

const publicSans = Public_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-public-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Jupiter",
  description: "A quiet place for the things that make life worth living.",
};

export const viewport: Viewport = {
  themeColor: "#101B24",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${literata.variable} ${publicSans.variable}`}>
      <body>
        <BackgroundField />
        {children}
      </body>
    </html>
  );
}
