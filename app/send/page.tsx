"use client"

import { useState } from "react"
import Link from "next/link"
import { Textarea } from "@/components/ui/textarea"
import { Copy, ArrowLeft, Share2, CheckCircle2, Loader2 } from "lucide-react"
import { shareText } from "../actions"
import { QRCodeSVG } from "qrcode.react"
import { toast } from "sonner"

export default function SendPage() {
  const [text, setText] = useState("")
  const [shareCode, setShareCode] = useState("")
  const [isSharing, setIsSharing] = useState(false)
  const [copied, setCopied] = useState(false)
  const [urlCopied, setUrlCopied] = useState(false)

  const handleShare = async () => {
    if (!text.trim()) return
    setIsSharing(true)
    try {
      const code = await shareText(text)
      setShareCode(code)
      toast.success("Share created")
    } catch (error) {
      toast.error("Failed to share")
    } finally {
      setIsSharing(false)
    }
  }

  const copyCode = async () => {
    await navigator.clipboard.writeText(shareCode)
    setCopied(true)
    toast.success("Code copied")
    setTimeout(() => setCopied(false), 2000)
  }

  const copyUrl = async () => {
    const url = `${window.location.origin}/${shareCode}`
    await navigator.clipboard.writeText(url)
    setUrlCopied(true)
    toast.success("Link copied")
    setTimeout(() => setUrlCopied(false), 2000)
  }

  const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/${shareCode}`

  return (
    <div className="min-h-[100dvh] bg-zinc-950 py-12 flex flex-col items-center animate-reveal">
      <div className="max-w-4xl mx-auto w-full px-6">
        <Link href="/" className="inline-flex items-center text-zinc-500 hover:text-zinc-100 transition-colors mb-12 group text-sm font-medium">
          <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>

        <div className="mb-12">
            <h1 className="text-4xl font-bold tracking-tighter text-zinc-100">Share Text</h1>
            <p className="text-zinc-500 mt-2 font-medium">Temporary data streams that expire in 60 minutes.</p>
        </div>

        {!shareCode ? (
          <div className="space-y-8">
            <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste code, notes, or raw data here..."
                className="min-h-[500px] w-full bg-zinc-900/30 border border-zinc-800 rounded-2xl p-8 text-lg focus:outline-none transition-butter resize-y font-mono leading-relaxed placeholder:text-zinc-700"
            />
            
            <button
                onClick={handleShare}
                disabled={!text.trim() || isSharing}
                className="w-full h-16 bg-zinc-50 text-zinc-950 disabled:opacity-20 font-bold rounded-xl text-lg transition-butter active:scale-[0.98] flex items-center justify-center shadow-lg"
            >
                {isSharing ? <Loader2 size={24} className="animate-spin" /> : <Share2 size={22} className="mr-3" />}
                {isSharing ? "Creating link..." : "Create Secure Share"}
            </button>
          </div>
        ) : (
          <div className="space-y-12 animate-reveal">
            <div className="flex flex-col md:flex-row items-center gap-12 p-10 bg-zinc-900/50 border border-zinc-800 rounded-3xl">
                <div className="flex-grow space-y-8 text-center md:text-left w-full">
                    <div className="space-y-2">
                        <div className="flex items-center justify-center md:justify-start space-x-3 text-zinc-100">
                            <CheckCircle2 size={24} className="text-blue-400" />
                            <h2 className="text-2xl font-bold tracking-tight">Stream Active</h2>
                        </div>
                        <p className="text-zinc-500 text-sm font-medium">Link will expire in 60 minutes.</p>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Access URL</label>
                            <div className="relative flex items-center">
                                <input readOnly value={shareUrl} className="w-full bg-black border border-zinc-800 text-zinc-300 rounded-xl py-4 px-5 font-mono text-xs focus:outline-none pr-14" />
                                <button onClick={copyUrl} className="absolute right-3 p-2 text-zinc-500 hover:text-zinc-100 transition-colors">
                                    {urlCopied ? <CheckCircle2 size={18} className="text-blue-400" /> : <Copy size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Code</label>
                                <div className="bg-black border border-zinc-800 rounded-xl py-4 text-center">
                                    <p className="text-2xl font-bold font-mono tracking-[0.2em] text-zinc-100">{shareCode}</p>
                                </div>
                            </div>
                            <button onClick={copyCode} className="mt-6 h-16 bg-zinc-50 text-zinc-950 rounded-xl font-bold flex items-center justify-center transition-butter active:scale-95">
                                <Copy size={20} className="mr-2" /> {copied ? "Copied" : "Copy"}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="shrink-0 bg-white p-6 rounded-3xl shadow-xl">
                    <QRCodeSVG value={shareUrl} size={160} level="H" />
                </div>
            </div>

            <div className="flex justify-center">
                <button onClick={() => { setShareCode(""); setText(""); }} className="text-zinc-500 hover:text-zinc-100 text-[11px] font-bold uppercase tracking-widest border-b border-zinc-900 pb-1 transition-colors">
                    Share New Data
                </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
