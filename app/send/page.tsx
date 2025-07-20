"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Copy, ArrowLeft, Share2, Clock, ExternalLink } from "lucide-react"
import { shareText } from "../actions"

export default function SendPage() {
  const [text, setText] = useState("")
  const [shareCode, setShareCode] = useState("")
  const [isSharing, setIsSharing] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    if (!text.trim()) return

    setIsSharing(true)
    try {
      const code = await shareText(text)
      setShareCode(code)
    } catch (error) {
      console.error("Failed to share text:", error)
      alert("Failed to share text. Please try again.")
    } finally {
      setIsSharing(false)
    }
  }

  const copyCode = async () => {
    await navigator.clipboard.writeText(shareCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const copyUrl = async () => {
    const url = `${window.location.origin}/receive?code=${shareCode}`
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/receive?code=${shareCode}`

  return (
    <div className="min-h-screen bg-black text-white relative">
      {/* Dotted grid background */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: "radial-gradient(circle, #374151 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />

      <div className="relative z-10">
        <nav className="border-b border-gray-800 px-6 py-4">
          <div className="flex items-center justify-between max-w-6xl mx-auto">
            <div className="flex items-center space-x-8">
              <Link href="/" className="flex items-center space-x-2 text-gray-300 hover:text-white">
                <ArrowLeft className="h-4 w-4" />
                <span>QuickText</span>
              </Link>
              <div className="hidden md:flex items-center space-x-6 text-sm text-gray-400">
                <span>Tools</span>
                <span>/</span>
                <span>Text Sharing</span>
              </div>
            </div>
            {!shareCode && (
              <Button
                onClick={handleShare}
                disabled={!text.trim() || isSharing}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {isSharing ? "Sharing..." : "Share"}
              </Button>
            )}
          </div>
        </nav>

        <main className="max-w-4xl mx-auto px-6 py-8 min-h-[calc(100vh-200px)]">
          {!shareCode ? (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold">Share Your Text</h1>
                <p className="text-gray-400">Write or paste your text below to generate a shareable code</p>
                <div className="flex items-center justify-center space-x-2 text-sm text-yellow-400">
                  <Clock className="h-4 w-4" />
                  <span>Shared text expires after 1 hour</span>
                </div>
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-lg">
                <Textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Write or paste your text here..."
                  className="min-h-[400px] bg-transparent border-0 text-white placeholder:text-gray-500 resize-none focus:ring-0 text-base"
                />
              </div>

              <div className="flex justify-center">
                <Button
                  onClick={handleShare}
                  disabled={!text.trim() || isSharing}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 px-8"
                >
                  <Share2 className="mr-2 h-5 w-5" />
                  {isSharing ? "Creating Share..." : "Create Share"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold">Text Shared Successfully!</h1>
                <p className="text-gray-400">Share this code or URL with others to give them access to your text</p>
                <div className="flex items-center justify-center space-x-2 text-sm text-yellow-400">
                  <Clock className="h-4 w-4" />
                  <span>Expires in 1 hour</span>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
                <Card className="bg-gray-900 border-gray-800">
                  <CardContent className="p-6 text-center space-y-4">
                    <div>
                      <p className="text-sm text-gray-400 mb-2">Share Code:</p>
                      <div className="text-3xl font-mono font-bold tracking-wider text-blue-400">{shareCode}</div>
                    </div>
                    <Button
                      onClick={copyCode}
                      variant="outline"
                      className="w-full border-gray-600 text-gray-300 hover:bg-gray-800 bg-transparent"
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      {copied ? "Copied!" : "Copy Code"}
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900 border-gray-800">
                  <CardContent className="p-6 space-y-4">
                    <div>
                      <p className="text-sm text-gray-400 mb-2">Direct URL:</p>
                      <div className="text-sm text-blue-400 break-all bg-gray-800 p-2 rounded">{shareUrl}</div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        onClick={copyUrl}
                        variant="outline"
                        className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800 bg-transparent"
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        Copy URL
                      </Button>
                      <Button
                        onClick={() => window.open(shareUrl, "_blank")}
                        variant="outline"
                        className="border-gray-600 text-gray-300 hover:bg-gray-800 bg-transparent"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex justify-center space-x-4">
                <Button
                  onClick={() => {
                    setShareCode("")
                    setText("")
                  }}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Share Another Text
                </Button>
                <Link href="/receive">
                  <Button className="bg-blue-600 hover:bg-blue-700">Go to Receive</Button>
                </Link>
              </div>
            </div>
          )}
        </main>

        <footer className="border-t border-gray-800 mt-20">
          <div className="max-w-6xl mx-auto px-6 py-8">
            <div className="text-center">
              <p
                className="text-gray-400 font-medium tracking-wide"
                style={{ fontFamily: "Inter, system-ui, sans-serif" }}
              >
                made with <span className="text-red-500 animate-pulse">❤️</span> by{" "}
                <span className="text-white font-semibold">Akshit Suthar</span>
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
