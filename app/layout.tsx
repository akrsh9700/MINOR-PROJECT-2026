import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider"

// 1. Pehle fonts define karein
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 2. Metadata configuration
export const metadata: Metadata = {
  title: "Advanced Healthcare Management System",
  description: "Modern Healthcare Solutions",
};

// 3. Root Layout Function
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased emergency-pattern`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>

      </body>
    </html>
  );
}