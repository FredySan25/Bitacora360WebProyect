import type { Metadata } from "next";
import {
  Atkinson_Hyperlegible_Mono,
  Atkinson_Hyperlegible_Next,
  Bricolage_Grotesque,
} from "next/font/google";
import "./globals.css";

// Body text: drawn to stay legible at small sizes. next/font has no metrics to
// size-adjust a fallback for this family, so the plain fallback stack is used
const atkinsonSans = Atkinson_Hyperlegible_Next({
  variable: "--font-atkinson-sans",
  subsets: ["latin"],
  adjustFontFallback: false,
  fallback: ["Arial", "Helvetica", "sans-serif"],
});

const atkinsonMono = Atkinson_Hyperlegible_Mono({
  variable: "--font-atkinson-mono",
  subsets: ["latin"],
  adjustFontFallback: false,
  fallback: ["ui-monospace", "monospace"],
});

// Titles and big figures; the width axis lets globals.css condense it
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  axes: ["wdth"],
});

export const metadata: Metadata = {
  title: "Bitácora360",
  description: "Tu registro personal de hábitos, finanzas y watchlist.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${atkinsonSans.variable} ${atkinsonMono.variable} ${bricolage.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col text-ink">{children}</body>
    </html>
  );
}
