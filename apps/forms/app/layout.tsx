import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Patient Forms - Multi-Zone",
  description: "Patient intake and registration forms",
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
        {/* Navigation bar with link back to main app */}
        <nav className="bg-slate-800 text-white px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <h1 className="text-xl font-semibold">Patient Forms</h1>
            <a 
              href="/" 
              className="text-sm hover:text-slate-300 transition-colors"
            >
              ← Back to Patient Table
            </a>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}

