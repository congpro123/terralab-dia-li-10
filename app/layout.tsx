import type { Metadata } from "next";
import "./globals.css";
import "./field-theme.css";
import "./atlas.css";
import "./field-lab.css";
import "./language.css";

export const metadata: Metadata = {
  manifest: '/manifest.webmanifest',
  title: "TerraLab — Khám phá Địa lí 10",
  description: "Đọc, khám phá và thấu hiểu Trái Đất qua 17 bài học song ngữ và các thí nghiệm tương tác.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className="antialiased">{children}</body>
    </html>
  );
}
