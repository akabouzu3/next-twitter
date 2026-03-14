import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "K",
    template: "%s / K",
  },
  description: "Kazuoが作成しているTwitterのcloneです。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
        <div id="layers" className=""></div>
        {children}
      </body>
    </html>
  );
}
