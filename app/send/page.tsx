"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Copy, ArrowLeft, Share2, Clock, ExternalLink, CheckCircle2 } from "lucide-react"
import { shareText } from "../actions"

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
    setUrlCopied(true)
    setTimeout(() => setUrlCopied(false), 2000)
  }

  const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/receive?code=${shareCode}`

  return (
    <div className="min-h-screen bg-black text-white px-4 sm:px-6 md:p-8 font-sans flex flex-col items-center">
      {/* Background effect */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at center, #1e3a8a 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[70vw] h-[50vh] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto mt-8 relative z-10 w-full px-4">
        <Link href="/" className="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-8 group">
          <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>

        <h1 className="text-3xl sm:text-4xl font-bold mb-2 tracking-tight">Share Text</h1>
        <p className="text-gray-400 mb-8 max-w-lg">Write or paste your exact text below. It will be securely stored and deleted in exactly 1 hour.</p>

        {!shareCode ? (
          <div className="bg-[#111] border border-gray-800 rounded-3xl p-6 sm:p-8">
             <div className="space-y-6">
                <Textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Paste your text or code block here..."
                  className="min-h-[300px] sm:min-h-[400px] w-full bg-black border border-gray-700 text-white rounded-xl p-6 text-lg focus:outline-none focus:border-blue-500 transition-colors placeholder:text-gray-700 resize-none font-mono"
                />
                
                <Button
                  onClick={handleShare}
                  disabled={!text.trim() || isSharing}
                  className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-lg transition-all flex items-center justify-center font-sans tracking-wide"
                >
                  <Share2 className="mr-2 h-5 w-5" />
                  {isSharing ? "Creating Secure Link..." : "Create Secure Share"}
                </Button>
             </div>
          </div>
        ) : (
          <div className="bg-blue-500/5 border border-blue-500/20 rounded-3xl p-8 text-center animate-in fade-in zoom-in duration-300">
            <div className="text-center mb-8">
               <div className="w-16 h-16 bg-blue-500/20 text-blue-400 flex items-center justify-center rounded-full mx-auto mb-4 scale-110">
                  <CheckCircle2 size={32} />
               </div>
               <h2 className="text-2xl font-bold">Text Published!</h2>
               <div className="flex items-center justify-center text-orange-400 text-sm mt-3 font-medium">
                  <Clock size={16} className="mr-1.5 inline"/>
                  Expires automatically in 60 minutes
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
               {/* Code Block */}
               <div className="bg-black/40 border border-white/10 rounded-2xl p-6 md:p-8 flex flex-col items-center justify-center space-y-6 flex-1">
                 <div>
                   <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Share Code</p>
                   <p className="text-5xl font-black tracking-widest text-blue-400 font-mono select-all bg-blue-500/10 py-3 px-6 rounded-xl">{shareCode}</p>
                 </div>
                 <Button onClick={copyCode} variant="outline" className="w-full border-gray-700 hover:bg-white hover:text-black hover:border-white transition-all bg-transparent h-12">
                   {copied ? <span className="flex items-center justify-center"><CheckCircle2 size={18} className="mr-2" /> Copied!</span> : <span className="flex items-center justify-center"><Copy size={18} className="mr-2"/> Copy Code</span>}
                 </Button>
               </div>

               {/* Direct Link Block */}
               <div className="bg-black/40 border border-white/10 rounded-2xl p-6 md:p-8 flex flex-col space-y-6 flex-1 text-left">
                  <div className="flex-grow">
                     <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Direct Link</p>
                     <input readOnly value={shareUrl} className="w-full bg-[#111] border border-gray-800 text-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none mb-4" />
                     <p className="text-gray-500 text-sm">Send this link to anyone to grant them immediate read-access.</p>
                  </div>
                  <div className="flex space-x-3">
                     <Button onClick={copyUrl} variant="outline" className="flex-1 border-gray-700 hover:bg-white hover:text-black hover:border-white transition-all bg-transparent h-12">
                       {urlCopied ? <span className="flex items-center justify-center"><CheckCircle2 size={18} className="mr-2" /> Copied!</span> : <span className="flex items-center justify-center"><Copy size={18} className="mr-2"/> Copy Link</span>}
                     </Button>
                     <Button onClick={() => window.open(shareUrl, "_blank")} variant="outline" className="shrink-0 border-gray-700 hover:bg-white hover:text-black hover:border-white transition-all bg-transparent h-12 w-12 p-0">
                       <ExternalLink size={18} />
                     </Button>
                  </div>
               </div>
            </div>

            <div className="mt-8 border-t border-gray-800 pt-6">
               <button onClick={() => { setShareCode(""); setText(""); }} className="text-gray-400 hover:text-white transition-colors text-sm font-medium">
                  Share another text snippet
               </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}