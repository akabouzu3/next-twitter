import type { Metadata } from "next";
import "./globals.css";

const appOrigin =
  process.env.NEXT_PUBLIC_APP_ORIGIN || process.env.APP_ORIGIN || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(appOrigin),
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
