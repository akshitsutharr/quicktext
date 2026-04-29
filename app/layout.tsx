import type React from "react"
import type { Metadata } from "next"
import { Outfit } from "next/font/google"
import Script from "next/script"
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
    canonical: siteUrl,
  },

  authors: [{ name: "Akshit Suthar", url: siteUrl }],
  creator: "Akshit Suthar",
  publisher: "QuickText",
  category: "technology",

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  openGraph: {
    title: "QuickText | Fast, Temporary Text, File & URL Sharing",
    description:
      "Share text, files, and links instantly with short codes. No signup, real-time, and built for seamless cross-device transfer.",
    url: siteUrl,
    siteName: "QuickText",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "QuickText preview",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "QuickText | Instant Text, File & URL Sharing",
    description:
      "Temporary, anonymous sharing for text, files, and URLs.",
    images: [`${siteUrl}/og-image.png`],
  },

  icons: {
    icon: "/favicon1.png",
    shortcut: "/favicon1.png",
    apple: "/favicon1.png",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body
        className={
          outfit.className +
          " min-h-screen bg-black text-white antialiased"
        }
      >
        <Script
          id="structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "QuickText",
              url: siteUrl,
            }),
          }}
        />

        {children}
      </body>
    </html>
  )
}