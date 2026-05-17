import type { Metadata, Viewport } from "next";
import "./globals.css";
import PWARegister from "./_components/PWARegister";
import SoundPrefetch from "./_shared/SoundPrefetch";

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
  userScalable: false,
  viewportFit: "cover",
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
        <SoundPrefetch />
      </body>
    </html>
  );
}
