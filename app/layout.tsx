import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "QuickText - Secure, Fast, Self-Destructing Text Sharing",
  description:
    "QuickText is a blazing-fast, minimalistic text sharing platform. Share notes and code snippets instantly with a 5-digit code or direct link. No login, secure, real-time, and auto-expiring.",
  keywords: [
    "QuickText",
    "qtext",
    "quicktext.io",
    "quicktext",
    "text sharing",
    "self destructing text",
    "secure text sharing",
    "temporary notes",
    "pastebin alternative",
    "anonymous messaging",
    "real-time collaboration",
  ],
  openGraph: {
    title: "QuickText - Secure, Fast, Self-Destructing Text Sharing",
    description:
      "Share notes and snippets instantly with QuickText using a 5-digit code or link. Real-time, secure, no signup required.",
    url: "https://quicktextt.vercel.app/",
    siteName: "QuickText",
    images: [
      {
        url: "https://quicktextt.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "QuickText Preview",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "QuickText - Fast & Secure Text Sharing",
    description:
      "Anonymous, temporary, real-time text sharing. Works on all devices.",
    images: ["https://quicktextt.vercel.app/og-image.png"],
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
      <body className={inter.className + " min-h-screen bg-black text-white antialiased"}>
        {children}
      </body>
    </html>
  )
}
