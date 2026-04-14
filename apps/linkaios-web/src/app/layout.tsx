import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { ShellLayout } from "@/components/shell-layout";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LiNKaios",
  description: "LiNKtrend command centre",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ShellLayout showDevtools={process.env.NODE_ENV === "development"}>
          {children}
        </ShellLayout>
      </body>
    </html>
  );
}
