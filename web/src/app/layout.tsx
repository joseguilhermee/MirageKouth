import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Figtree, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
  axes: ["opsz"],
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
  title: "MirageKouth — Descubra seu arquétipo",
  description:
    "Responda perguntas rápidas e curiosas. Suas respostas são criptografadas no seu navegador antes de saírem da sua tela.",
  icons: {
    icon: "/logos/app-icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#d6e6ef",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${bricolage.variable} ${figtree.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col text-ink font-sans">{children}</body>
    </html>
  );
}
