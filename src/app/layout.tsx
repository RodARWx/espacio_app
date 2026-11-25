import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ESPACIO · Encuentra el espacio que realmente necesitas",
  description:
    "Plataforma de búsqueda, comparación espacial con croquis referenciales y agendamiento verificado de inmuebles en alquiler en Ecuador.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-[#F5F7FA] font-sans text-[#17324D] antialiased">
        {children}
      </body>
    </html>
  );
}
