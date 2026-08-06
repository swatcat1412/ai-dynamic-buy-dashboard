import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Dynamic Buy Dashboard",
  description: "Dashboard สำหรับวิเคราะห์ Dynamic Buy Zone ของหุ้นสหรัฐฯ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}

