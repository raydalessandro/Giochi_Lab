import type { Metadata, Viewport } from "next";
import "./globals.css";
import PWARegister from "./_components/PWARegister";

export const metadata: Metadata = {
  title: "Giochi Lab",
  description:
    "Quattro giochi per imparare giocando — geografia, chimica, geometria, fisica.",
  applicationName: "Giochi Lab",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Giochi Lab",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it">
      <body>
        {children}
        <PWARegister />
      </body>
    </html>
  );
}
