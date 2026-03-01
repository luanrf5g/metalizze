import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { AppShell } from "@/components/AppShell";

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Metalizze ERP | Gestão de Produção",
  description: "Sistema de gestão de estoque e corte de chapas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-zinc-50 text-zinc-950`}>
        <AppShell>
          {children}
        </AppShell>
        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  );
}
