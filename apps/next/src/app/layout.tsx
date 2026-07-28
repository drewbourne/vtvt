import {
  AppContent,
  AppFooter,
  AppHeader,
  AppLayout,
  AppSidebar,
} from "@/ui/app/AppLayout";
import "./globals.css";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "@fbt/vtvt",
  description: "NATS-maxxed Node.js-based trading platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <AppLayout>
          <AppSidebar>
            <nav>Nav</nav>
          </AppSidebar>
          <AppHeader>AppHeader</AppHeader>
          <AppContent>
            <main>{children}</main>
          </AppContent>
          <AppFooter>AppFooter</AppFooter>
        </AppLayout>
      </body>
    </html>
  );
}
