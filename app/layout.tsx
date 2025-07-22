import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "QuickText - Share Text Instantly",
  description:
    "Share your text or code instantly with a simple 5-digit code. The fastest way to share text snippets online.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
          <link rel="icon" href="/favicon.png" sizes="any" />
      </head>
      <body className={inter.className + " min-h-screen flex flex-col bg-black text-white"}>
        {children}
      </body>
    </html>
  )
}
