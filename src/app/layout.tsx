import type { Metadata, Viewport } from "next";
import "./globals.css";
import { BottomNav } from "@/components/BottomNav";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";

export const metadata: Metadata = {
  title: "DO OR DIE — Personal Task Tracker",
  description: "High-stakes, disciplined daily task checklist and habit tracker PWA.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "DO OR DIE",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark bg-black">
      <body className="min-h-screen bg-black text-zinc-100 selection:bg-red-500/30 selection:text-red-200 antialiased flex flex-col items-center">
        <ServiceWorkerRegister />
        <main className="w-full max-w-md min-h-screen flex flex-col bg-black border-x border-[#18181f]/60 relative pb-nav">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
