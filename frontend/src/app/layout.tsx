import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"]})

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
    <html lang="en">
      <body className={`${inter.className} bg-zinc-50 text-zinc-950 flex min-h-screen`}>
        <Sidebar />

        <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
