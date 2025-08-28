"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Download, Save, Clock, AlertCircle,Copy } from "lucide-react"
import { getSharedText, updateSharedText, getTextStats } from "../actions"

export default function ReceivePage() {
  const searchParams = useSearchParams()
  const urlCode = searchParams.get("code")

  const [code, setCode] = useState(urlCode || "")
  const [text, setText] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  const [currentCode, setCurrentCode] = useState("")
  const [expiresAt, setExpiresAt] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState<string>("")
  const [isCopied, setIsCopied] = useState(false)

  // Auto-load text if code is provided in URL
  useEffect(() => {
    if (urlCode && urlCode.length === 5) {
      handleReceive(urlCode)
    }
  }, [urlCode])

  // Update countdown timer
  useEffect(() => {
    if (!expiresAt) return

    const updateTimer = () => {
      const now = new Date()
      const expires = new Date(expiresAt)
      const diff = expires.getTime() - now.getTime()

      if (diff <= 0) {
        setTimeLeft("Expired")
        return
      }

      const minutes = Math.floor(diff / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)
      setTimeLeft(`${minutes}m ${seconds}s`)
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [expiresAt])

  const handleCopy = async () => {
  if (!text.trim()) return
  
  try {
    await navigator.clipboard.writeText(text)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  } catch (error) {
    const textArea = document.createElement('textarea')
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }
  }

  const handleReceive = async (codeToUse?: string) => {
    const targetCode = codeToUse || code
    if (!targetCode.trim() || targetCode.length !== 5) {
      setError("Please enter a valid 5-digit code")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const [sharedText, stats] = await Promise.all([
        getSharedText(targetCode.toUpperCase()),
        getTextStats(targetCode.toUpperCase()),
      ])

      if (sharedText && !stats.isExpired) {
        setText(sharedText)
        setCurrentCode(targetCode.toUpperCase())
        setExpiresAt(stats.expiresAt)
        setIsEditing(false)
      } else if (stats.isExpired) {
        setError("This code has expired. Shared texts are only available for 1 hour.")
      } else {
        setError("Code not found. Please check and try again.")
      }
    } catch (error) {
      setError("Failed to retrieve text. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!currentCode || !text.trim()) return

    setIsSaving(true)
    try {
      const success = await updateSharedText(currentCode, text)
      if (success) {
        setIsEditing(false)
      } else {
        setError("Failed to save changes. The text may have expired.")
      }
    } catch (error) {
      setError("Failed to save changes. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleReceive()
    }
  }

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
            {text && (
              <div className="flex items-center space-x-2 sm:space-x-4">
                {timeLeft && (
                  <div className="flex items-center space-x-1 text-xs sm:text-sm text-yellow-400">
                    <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">{timeLeft}</span>
                    <span className="sm:hidden">{timeLeft.split(' ')[0]}</span>
                  </div>
                )}
                <div className="flex space-x-2">
                  {isEditing ? (
                    <Button 
                      onClick={handleSave} 
                      disabled={isSaving} 
                      className="bg-green-600 hover:bg-green-700 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 transform hover:scale-105 transition-all duration-200"
                    >
                      <Save className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">{isSaving ? "Saving..." : "Save"}</span>
                      <span className="sm:hidden">💾</span>
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => setIsEditing(true)} 
                      className="bg-orange-600 hover:bg-orange-700 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 transform hover:scale-105 transition-all duration-200"
                    >
                      <span className="hidden sm:inline">Edit</span>
                      <span className="sm:hidden">✏️</span>
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </nav>

        <main className="flex-1 flex items-center justify-center">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 w-full">
            {!text ? (
              <div className="space-y-6">
                <div className="text-center space-y-3 sm:space-y-4">
                  <h1 className="text-2xl sm:text-3xl font-bold">Receive Shared Text</h1>
                  <p className="text-gray-400 text-sm sm:text-base px-4">Enter the 5-digit code to access shared text</p>
                  <div className="flex items-center justify-center space-x-2 text-xs sm:text-sm text-yellow-400">
                    <AlertCircle className="h-4 w-4" />
                    <span>Shared texts expire after 1 hour</span>
                  </div>
                </div>

                <div className="max-w-sm sm:max-w-md mx-auto space-y-4">
                  <div>
                    <Input
                      value={code}
                      onChange={(e) => {
                        const value = e.target.value
                          .toUpperCase()
                          .replace(/[^A-Z0-9]/g, "")
                          .slice(0, 5)
                        setCode(value)
                        setError("")
                      }}
                      onKeyPress={handleKeyPress}
                      placeholder="Enter 5-digit code"
                      className="text-center text-xl sm:text-2xl font-mono tracking-wider bg-gray-900/50 backdrop-blur-sm border-2 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500 transition-all duration-200 shadow-lg"
                      maxLength={5}
                    />
                    {error && <p className="text-red-400 text-xs sm:text-sm mt-2 text-center px-4">{error}</p>}
                  </div>

                  <Button
                    onClick={() => handleReceive()}
                    disabled={!code.trim() || code.length !== 5 || isLoading}
                    size="lg"
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200 shadow-lg"
                  >
                    <Download className="mr-2 h-5 w-5" />
                    {isLoading ? "Loading..." : "Access Text"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0">
                  <div className="flex-1">
                    <h1 className="text-2xl sm:text-3xl font-bold">Shared Text</h1>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-gray-400 text-sm space-y-1 sm:space-y-0">
                      <span>Code: {currentCode}</span>
                      {timeLeft && (
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>Expires in: {timeLeft}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                    <Button
                      onClick={() => {
                        setText("")
                        setCode("")
                        setCurrentCode("")
                        setExpiresAt(null)
                        setIsEditing(false)
                        setError("")
                      }}
                      variant="outline"
                      className="flex-1 sm:flex-none border-2 border-blue-600 text-blue-300 hover:bg-blue-800 hover:border-blue-500 bg-transparent transform hover:scale-105 transition-all duration-200"
                    >
                      Access Another
                    </Button>
                    <Button
                      onClick={handleCopy}
                      disabled={!text.trim()}
                      variant="outline"
                      className="flex-1 sm:flex-none border-2 border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500 bg-transparent transform hover:scale-105 transition-all duration-200"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      {isCopied ? "Copied!" : "Copy"}
                    </Button>
                  </div>
                </div>

                <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl overflow-hidden shadow-xl">
                  <Textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    readOnly={!isEditing}
                    className={`min-h-[300px] sm:min-h-[400px] bg-transparent border-0 text-white resize-none focus:ring-0 text-sm sm:text-base p-4 sm:p-6 ${
                      !isEditing ? "cursor-default" : ""
                    }`}
                  />
                </div>

                {isEditing && (
                  <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4">
                    <Button
                      onClick={() => setIsEditing(false)}
                      variant="outline"
                      className="w-full sm:w-auto border-2 border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500 bg-transparent transform hover:scale-105 transition-all duration-200"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleSave} 
                      disabled={isSaving} 
                      className="w-full sm:w-auto bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200 shadow-lg"
                    >
                      <Save className="mr-2 h-4 w-4" />
                      {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                )}
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