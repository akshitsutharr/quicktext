"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Download, Save, Clock, Copy, AlignLeft, CheckCircle2 } from "lucide-react"
import { getSharedText, updateSharedText, getTextStats } from "../actions"

function TextReceiver() {
  const searchParams = useSearchParams()
  const initialCode = searchParams?.get("code") || ""

  const [code, setCode] = useState(initialCode)
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
    if (initialCode && initialCode.length === 5) {
      handleReceive(initialCode)
    }
  }, [initialCode])

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
    } catch (e) {
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

  return (
    <div className="max-w-4xl mx-auto mt-8 relative z-10 w-full px-4">
      <Link href="/" className="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-8 group">
        <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        Back to Home
      </Link>

      <h1 className="text-3xl sm:text-4xl font-bold mb-2 tracking-tight">Receive Text</h1>
      <p className="text-gray-400 mb-8 max-w-lg">Enter a 5-digit code to securely view and edit a shared text snippet.</p>

      {!text ? (
        <div className="bg-[#111] border border-gray-800 rounded-3xl p-6 sm:p-8 max-w-xl">
          <div className="space-y-6">
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-400 mb-2">
                5-Digit Share Code
              </label>
              <input
                id="code"
                type="text"
                maxLength={5}
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))
                  setError("")
                }}
                onKeyDown={(e) => e.key === "Enter" && handleReceive()}
                className="w-full bg-black border border-gray-700 text-white rounded-xl px-4 py-4 text-center text-4xl font-mono tracking-[0.5em] focus:outline-none focus:border-blue-500 transition-colors uppercase placeholder:text-gray-800"
                placeholder="XXXXX"
              />
            </div>
            
            {error && (
              <p className="text-red-400 text-sm font-medium text-center">{error}</p>
            )}

            <Button
              onClick={() => handleReceive()}
              disabled={code.length !== 5 || isLoading}
              className="w-full h-14 bg-white hover:bg-gray-200 text-black font-semibold rounded-xl text-lg transition-all flex items-center justify-center"
            >
              <AlignLeft className="mr-2 h-5 w-5" />
              {isLoading ? "Validating Code..." : "Access Text"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-[#111] border border-gray-800 rounded-3xl p-8 relative overflow-hidden group shadow-2xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 mb-8 pb-6 border-b border-gray-800">
             <div className="flex items-center space-x-6">
                <div className="w-14 h-14 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center font-bold tracking-widest font-mono select-all">
                  {currentCode}
                </div>
                <div>
                   {timeLeft && (
                     <div className="flex items-center text-orange-400 text-sm font-medium bg-orange-500/10 px-3 py-1.5 rounded-full">
                       <Clock size={14} className="mr-2 animate-pulse"/>
                       Expires in {timeLeft}
                     </div>
                   )}
                </div>
             </div>

             <div className="flex items-center space-x-3 w-full sm:w-auto">
                <Button onClick={handleCopy} variant="outline" className="flex-1 sm:flex-none border-gray-700 hover:bg-white hover:text-black hover:border-white transition-all bg-transparent h-10">
                   {isCopied ? <CheckCircle2 size={16} className="mr-2" /> : <Copy size={16} className="mr-2" />}
                   {isCopied ? "Copied" : "Copy text"}
                </Button>
                {isEditing ? (
                  <Button onClick={handleSave} disabled={isSaving} className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 h-10 transition-all text-white font-medium">
                     <Save size={16} className="mr-2"/>
                     {isSaving ? "Saving..." : "Save Edits"}
                  </Button>
                ) : (
                  <Button onClick={() => setIsEditing(true)} className="flex-1 sm:flex-none bg-white hover:bg-gray-200 text-black h-10 transition-all font-medium">
                     Edit text
                  </Button>
                )}
             </div>
          </div>

          {/* Editor */}
          <div className="relative">
             <Textarea
               value={text}
               onChange={(e) => setText(e.target.value)}
               readOnly={!isEditing}
               className={`min-h-[400px] w-full bg-black border ${isEditing ? 'border-blue-500 focus:ring-1 focus:ring-blue-500' : 'border-gray-800'} text-white rounded-xl p-6 text-lg focus:outline-none transition-all resize-y font-mono leading-relaxed`}
             />
          </div>

          <div className="mt-8 flex justify-center">
             <button onClick={() => { setText(""); setCode(""); setCurrentCode(""); setExpiresAt(null); setIsEditing(false); setError(""); }} className="text-gray-500 hover:text-white transition-colors text-sm font-medium pb-1 border-b border-transparent hover:border-white">
                Input a different code
             </button>
          </div>

        </div>
      )}
    </div>
  )
}

export default function ReceivePage() {
  return (
    <div className="min-h-screen bg-black text-white px-4 sm:px-6 md:p-8 font-sans flex flex-col items-center">
       {/* Background effect */}
       <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at center, #1e3a8a 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
       <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[60vw] h-[50vh] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />

       <Suspense fallback={<div className="mt-20 text-gray-500 animate-pulse">Loading interface...</div>}>
         <TextReceiver />
       </Suspense>
    </div>
  )
}