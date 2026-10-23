import type { Metadata, Viewport } from "next";
import { Noto_Serif_Display, Figtree, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { THEME_BOOTSTRAP } from "@/lib/theme";

const editorial = Noto_Serif_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  display: "swap",
});

const figtree = Figtree({
  variable: "--font-sans",
  subsets: ["latin"],
});

// Só para a cifra: hexadecimal é dado, não decoração.
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KOUTH — Primeiro a pessoa. Depois o perfume.",
  description:
    "Sua história é o ponto de partida. Uma conversa pessoal para inspirar uma assinatura olfativa, com respostas cifradas no seu aparelho.",
  icons: {
    icon: "/brand/kouth-monogram.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#2e1f17",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      data-theme="dark"
      suppressHydrationWarning
      className={`${editorial.variable} ${figtree.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <head><script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP }} /></head>
      <body className="min-h-full flex flex-col text-ink font-sans">{children}</body>
    </html>
  );
}
