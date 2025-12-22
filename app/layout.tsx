import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "PrimeCast - Watch Live TV Channels Worldwide",
    template: "%s | PrimeCast",
  },
  description:
    "Discover thousands of live TV channels from 200+ countries. Watch news, sports, entertainment, movies, and more. Start your free trial today!",
  keywords: [
    "IPTV",
    "live TV",
    "TV channels",
    "online TV",
    "watch TV online",
    "international TV",
    "world TV channels",
    "TV streaming",
    "live television",
    "PrimeCast",
    "news channels",
    "sports channels",
    "entertainment",
  ],
  authors: [{ name: "PrimeCast" }],
  creator: "PrimeCast",
  publisher: "PrimeCast",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "PrimeCast",
    title: "PrimeCast - Watch Live TV Channels Worldwide",
    description:
      "Discover thousands of live TV channels from 200+ countries. Watch news, sports, entertainment, movies, and more.",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "PrimeCast - Live TV Streaming",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PrimeCast - Watch Live TV Channels Worldwide",
    description:
      "Discover thousands of live TV channels from 200+ countries. Start your free trial today!",
    images: ["/logo.png"],
  },
  verification: {
    google: "your-google-verification-code",
  },
  alternates: {
    canonical: "https://your-domain.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#7c3aed" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
