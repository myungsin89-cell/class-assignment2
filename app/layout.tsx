import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "학생 관리 시스템",
  description: "Excel 붙여넣기 기능이 있는 학생 관리 시스템",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
