"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Download, Save, Clock, AlertCircle } from "lucide-react"
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
            {text && (
              <div className="flex items-center space-x-4">
                {timeLeft && (
                  <div className="flex items-center space-x-1 text-sm text-yellow-400">
                    <Clock className="h-4 w-4" />
                    <span>{timeLeft}</span>
                  </div>
                )}
                <div className="flex space-x-2">
                  {isEditing ? (
                    <Button onClick={handleSave} disabled={isSaving} className="bg-green-600 hover:bg-green-700">
                      <Save className="mr-2 h-4 w-4" />
                      {isSaving ? "Saving..." : "Save"}
                    </Button>
                  ) : (
                    <Button onClick={() => setIsEditing(true)} className="bg-orange-600 hover:bg-orange-700">
                      Edit
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </nav>

        <main className="max-w-4xl mx-auto px-6 py-8 min-h-[calc(100vh-200px)]">
          {!text ? (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold">Receive Shared Text</h1>
                <p className="text-gray-400">Enter the 5-digit code to access shared text</p>
                <div className="flex items-center justify-center space-x-2 text-sm text-yellow-400">
                  <AlertCircle className="h-4 w-4" />
                  <span>Shared texts expire after 1 hour</span>
                </div>
              </div>

              <div className="max-w-md mx-auto space-y-4">
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
                    className="text-center text-2xl font-mono tracking-wider bg-gray-900 border-gray-700 text-white placeholder:text-gray-500"
                    maxLength={5}
                  />
                  {error && <p className="text-red-400 text-sm mt-2 text-center">{error}</p>}
                </div>

                <Button
                  onClick={() => handleReceive()}
                  disabled={!code.trim() || code.length !== 5 || isLoading}
                  size="lg"
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <Download className="mr-2 h-5 w-5" />
                  {isLoading ? "Loading..." : "Access Text"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold">Shared Text</h1>
                  <div className="flex items-center space-x-4 text-gray-400">
                    <span>Code: {currentCode}</span>
                    {timeLeft && (
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>Expires in: {timeLeft}</span>
                      </div>
                    )}
                  </div>
                </div>
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
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Access Another
                </Button>
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-lg">
                <Textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  readOnly={!isEditing}
                  className={`min-h-[400px] bg-transparent border-0 text-white resize-none focus:ring-0 text-base ${
                    !isEditing ? "cursor-default" : ""
                  }`}
                />
              </div>

              {isEditing && (
                <div className="flex justify-center space-x-4">
                  <Button
                    onClick={() => setIsEditing(false)}
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-gray-800"
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={isSaving} className="bg-green-600 hover:bg-green-700">
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              )}
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
                Made with <span className="text-red-500 animate-pulse">❤️</span> by{" "}
                <span className="text-white font-semibold">Akshit Suthar</span>
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
