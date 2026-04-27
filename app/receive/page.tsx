"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Clock, Copy, AlignLeft, CheckCircle2, QrCode, Zap, Save, Loader2 } from "lucide-react"
import { getSharedText, updateSharedText, getTextStats } from "../actions"
import { QRScanner } from "@/components/qr-scanner"
import { toast } from "sonner"

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
  const [showScanner, setShowScanner] = useState(false)

  useEffect(() => {
    if (initialCode && initialCode.length === 5) {
      handleReceive(initialCode)
    }
  }, [initialCode])

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
      toast.success("Copied to clipboard")
      setTimeout(() => setIsCopied(false), 2000)
    } catch (e) {
      toast.error("Failed to copy")
    }
  }

  const handleReceive = async (codeToUse?: string) => {
    const targetCode = codeToUse || code
    if (!targetCode.trim() || targetCode.length !== 5) {
      setError("Enter 5-digit code")
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
      } else {
        setError(stats.isExpired ? "This code has expired" : "Code not found")
      }
    } catch (error) {
      setError("An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleScan = (decodedText: string) => {
    setShowScanner(false)
    const parts = decodedText.split(/[=/]/)
    const scannedCode = parts[parts.length - 1].toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 5)
    if (scannedCode.length === 5) {
        setCode(scannedCode)
        handleReceive(scannedCode)
    } else {
        toast.error("Invalid QR format")
    }
  }

  const handleSave = async () => {
    if (!currentCode || !text.trim()) return
    setIsSaving(true)
    try {
      const success = await updateSharedText(currentCode, text)
      if (success) {
        setIsEditing(false)
        toast.success("Changes saved")
      } else {
        setError("Failed to save changes")
      }
    } catch (error) {
      toast.error("An error occurred")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto w-full px-6 animate-reveal">
      <Link href="/" className="inline-flex items-center text-zinc-500 hover:text-zinc-100 transition-colors mb-12 group text-sm font-medium">
        <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
        Back to Home
      </Link>

      <div className="mb-12">
        <h1 className="text-4xl font-bold tracking-tighter text-zinc-100">Receive Data</h1>
        <p className="text-zinc-500 mt-2 font-medium">Access shared snippets via numeric key or scan.</p>
      </div>

      {showScanner && <QRScanner onScan={handleScan} onClose={() => setShowScanner(false)} />}

      {!text ? (
        <div className="max-w-md bg-zinc-900/40 border border-zinc-800 rounded-2xl p-10">
          <div className="space-y-8">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Share Key</label>
                <button onClick={() => setShowScanner(true)} className="text-[11px] font-bold uppercase text-zinc-500 hover:text-zinc-100 flex items-center transition-colors">
                  <QrCode size={12} className="mr-1.5" /> Scan QR
                </button>
              </div>
              <input
                type="text"
                maxLength={5}
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && handleReceive()}
                className="w-full bg-black border border-zinc-800 rounded-xl py-5 text-center text-5xl font-bold font-mono tracking-[0.2em] text-zinc-100 focus:outline-none focus:ring-4 focus:ring-zinc-100/5 transition-butter placeholder:text-zinc-900"
                placeholder="·····"
              />
            </div>
            
            {error && <p className="text-xs font-semibold text-red-500 text-center">{error}</p>}

            <button
                onClick={() => handleReceive()}
                disabled={code.length !== 5 || isLoading}
                className="w-full h-14 bg-zinc-50 text-zinc-950 disabled:opacity-20 font-bold rounded-xl flex items-center justify-center transition-butter active:scale-[0.98]"
            >
                {isLoading ? <Loader2 size={20} className="animate-spin" /> : <AlignLeft size={20} className="mr-2.5" />}
                Access Data
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 pb-6 border-b border-zinc-900">
             <div className="flex items-center space-x-5">
                <div className="min-w-[108px] h-14 px-4 bg-zinc-50 text-zinc-950 rounded-xl flex items-center justify-center font-bold font-mono text-lg tracking-[0.18em]">
                  {currentCode}
                </div>
                <div>
                   <p className="text-[11px] font-bold uppercase text-zinc-500 mb-1">Snippet ID</p>
                   <div className="flex items-center text-zinc-100 text-xs font-bold">
                     <Clock size={12} className="mr-2 text-zinc-500"/>
                     {timeLeft}
                   </div>
                </div>
             </div>

             <div className="flex items-center space-x-3 w-full sm:w-auto">
                <button onClick={handleCopy} className="flex-1 sm:flex-none border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-100 px-6 h-11 rounded-xl text-[13px] font-bold transition-butter">
                   {isCopied ? "Copied" : "Copy Content"}
                </button>
                {isEditing ? (
                  <button onClick={handleSave} disabled={isSaving} className="flex-1 sm:flex-none bg-zinc-50 text-zinc-950 h-11 rounded-xl text-[13px] font-bold px-8 transition-butter active:scale-95 flex items-center justify-center">
                     {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} className="mr-2" />}
                     Save
                  </button>
                ) : (
                  <button onClick={() => setIsEditing(true)} className="flex-1 sm:flex-none bg-zinc-50 text-zinc-950 h-11 rounded-xl text-[13px] font-bold px-8 transition-butter active:scale-95">
                     Edit
                  </button>
                )}
             </div>
          </div>

          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            readOnly={!isEditing}
            className={`min-h-[500px] w-full bg-black border ${isEditing ? 'border-zinc-100' : 'border-zinc-800'} text-zinc-300 rounded-2xl p-10 text-lg focus:outline-none transition-butter resize-y font-mono leading-relaxed selection:bg-zinc-800`}
          />

          <div className="flex justify-center pt-10">
             <button onClick={() => { setText(""); setCode(""); setCurrentCode(""); setExpiresAt(null); setIsEditing(false); setError(""); }} className="text-zinc-500 hover:text-zinc-100 text-[11px] font-bold uppercase tracking-widest border-b border-zinc-900 pb-1 transition-colors">
                Access New Code
             </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ReceivePage() {
  return (
    <div className="min-h-[100dvh] bg-zinc-950 py-12 flex flex-col items-center">
       <Suspense fallback={<div className="mt-20 text-zinc-500 font-bold animate-pulse text-[11px] uppercase tracking-widest">Loading...</div>}>
         <TextReceiver />
       </Suspense>
    </div>
  )
}
