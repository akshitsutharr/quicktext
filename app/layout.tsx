import type React from "react"
import type { Metadata } from "next"
import { Outfit } from "next/font/google"
import "./globals.css"

const outfit = Outfit({ subsets: ["latin"] })

const siteUrl = "https://quicktextt.vercel.app"

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "QuickText",
  title: {
    default: "QuickText | Instant Text, File & URL Sharing",
    template: "%s | QuickText",
  },
  description:
    "QuickText is a fast, temporary sharing platform for text, files, and links. Share using short codes, transfer between devices, and shorten URLs instantly—no login required.",
  keywords: [
    "QuickText",
    "text sharing",
    "file sharing",
    "URL shortener",
    "temporary link sharing",
    "temporary file sharing",
    "self-destructing text",
    "pastebin alternative",
    "anonymous file transfer",
    "cross-device transfer",
    "device pairing",
    "short code sharing",
    "real-time sharing",
  ],
  alternates: {
    canonical: "/",
  },
  authors: [{ name: "Akshit Suthar", url: siteUrl }],
  creator: "Akshit Suthar",
  publisher: "QuickText",
  category: "technology",
  referrer: "origin-when-cross-origin",
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "QuickText | Fast, Temporary Text, File & URL Sharing",
    description:
      "Share text, files, and links instantly with short codes. No signup, real-time, and built for seamless cross-device transfer.",
    url: "/",
    siteName: "QuickText",
    locale: "en_US",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "QuickText preview - text, file and link sharing",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "QuickText | Instant Text, File & URL Sharing",
    description:
      "Temporary, anonymous sharing for text, files, and URLs. Fast, secure, and cross-device.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [{ url: "/favicon.png", type: "image/png" }],
    shortcut: ["/favicon.png"],
    apple: [{ url: "/favicon.png" }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
          <link rel="icon" href="/favicon.png" sizes="any" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={outfit.className + " min-h-screen bg-black text-white antialiased"}>
        {children}
      </body>
    </html>
  )
}
