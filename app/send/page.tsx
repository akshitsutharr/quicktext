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
    <div className="min-h-screen bg-black text-white relative flex flex-col">
      {/* Dotted grid background */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: "radial-gradient(circle, #374151 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />

      <div className="relative z-10 flex flex-col min-h-screen">
        <nav className="border-b border-gray-800 px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between max-w-6xl mx-auto">
            <div className="flex items-center space-x-4 sm:space-x-8">
              <Link href="/" className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors duration-200">
                <ArrowLeft className="h-4 w-4" />
                <span className="text-sm sm:text-base">QuickText</span>
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
                className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-sm sm:text-base px-3 sm:px-4 py-2 transform hover:scale-105 transition-all duration-200"
              >
                {isSharing ? "Sharing..." : "Share"}
              </Button>
            )}
          </div>
        </nav>

        <main className="flex-1 flex items-center justify-center">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 w-full">
            {!shareCode ? (
              <div className="space-y-6">
                <div className="text-center space-y-3 sm:space-y-4">
                  <h1 className="text-2xl sm:text-3xl font-bold">Share Your Text</h1>
                  <p className="text-gray-400 text-sm sm:text-base px-4">Write or paste your text below to generate a shareable code</p>
                  <div className="flex items-center justify-center space-x-2 text-xs sm:text-sm text-yellow-400">
                    <Clock className="h-4 w-4" />
                    <span>Shared text expires after 1 hour</span>
                  </div>
                </div>

                <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl overflow-hidden shadow-xl">
                  <Textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Write or paste your text here..."
                    className="min-h-[300px] sm:min-h-[400px] bg-transparent border-0 text-white placeholder:text-gray-500 resize-none focus:ring-0 text-sm sm:text-base p-4 sm:p-6"
                  />
                </div>

                <div className="flex justify-center px-4">
                  <Button
                    onClick={handleShare}
                    disabled={!text.trim() || isSharing}
                    size="lg"
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed px-6 sm:px-8 text-base sm:text-lg transform hover:scale-105 transition-all duration-200 shadow-lg"
                  >
                    <Share2 className="mr-2 h-5 w-5" />
                    {isSharing ? "Creating Share..." : "Create Share"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-center space-y-3 sm:space-y-4">
                  <h1 className="text-2xl sm:text-3xl font-bold">Text Shared Successfully!</h1>
                  <p className="text-gray-400 text-sm sm:text-base px-4">Share this code or URL with others to give them access to your text</p>
                  <div className="flex items-center justify-center space-x-2 text-xs sm:text-sm text-yellow-400">
                    <Clock className="h-4 w-4" />
                    <span>Expires in 1 hour</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto">
                  <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800 hover:bg-gray-900/70 transition-all duration-300 hover:scale-105 shadow-lg">
                    <CardContent className="p-4 sm:p-6 text-center space-y-4">
                      <div>
                        <p className="text-xs sm:text-sm text-gray-400 mb-2">Share Code:</p>
                        <div className="text-2xl sm:text-3xl font-mono font-bold tracking-wider text-blue-400">{shareCode}</div>
                      </div>
                      <Button
                        onClick={copyCode}
                        variant="outline"
                        className="w-full border-2 border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500 bg-transparent transform hover:scale-105 transition-all duration-200"
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        {copied ? "Copied!" : "Copy Code"}
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800 hover:bg-gray-900/70 transition-all duration-300 hover:scale-105 shadow-lg">
                    <CardContent className="p-4 sm:p-6 space-y-4">
                      <div>
                        <p className="text-xs sm:text-sm text-gray-400 mb-2">Direct URL:</p>
                        <div className="text-xs sm:text-sm text-blue-400 break-all bg-gray-800 p-2 sm:p-3 rounded-lg">{shareUrl}</div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          onClick={copyUrl}
                          variant="outline"
                          className="flex-1 border-2 border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500 bg-transparent transform hover:scale-105 transition-all duration-200"
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Copy URL
                        </Button>
                        <Button
                          onClick={() => window.open(shareUrl, "_blank")}
                          variant="outline"
                          className="border-2 border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500 bg-transparent transform hover:scale-105 transition-all duration-200"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4 px-4">
                  <Button
                    onClick={() => {
                      setShareCode("")
                      setText("")
                    }}
                    variant="outline"
                    className="w-full sm:w-auto border-2 border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500 bg-transparent transform hover:scale-105 transition-all duration-200"
                  >
                    Share Another Text
                  </Button>
                  <Link href="/receive" className="w-full sm:w-auto">
                    <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg">
                      Go to Receive
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-800 mt-auto">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
            <div className="text-center">
              <p className="text-gray-400 font-medium tracking-wide text-xs sm:text-sm">
                Made with{" "}
                <span className="text-red-500 animate-pulse inline-block hover:scale-125 transition-transform duration-300">
                  ❤️
                </span>{" "}
                by{" "}
                <a 
                  href="https://github.com/akshitsutharr" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-white font-semibold hover:text-blue-400 transition-colors duration-300 hover:underline"
                >
                  Akshit Suthar
                </a>
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}