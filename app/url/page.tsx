"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import { ArrowLeft, Copy, CheckCircle2, DownloadCloud, Loader2 } from "lucide-react"
import { shortenUrl } from "@/app/actions/urlActions"
import { QRCodeSVG } from "qrcode.react"
import { toast } from "sonner"

export default function UrlShortenerPage() {
  const [url, setUrl] = useState("")
  const [shortCode, setShortCode] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [copied, setCopied] = useState(false)
  const qrRef = useRef<SVGSVGElement>(null)

  const handleShorten = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url) { toast.error("Enter URL"); return; }
    try { new URL(url.startsWith('http') ? url : `https://${url}`); } catch { toast.error("Invalid URL"); return; }

    setIsProcessing(true)
    try {
      const code = await shortenUrl(url)
      setShortCode(code)
      toast.success("URL optimized")
    } catch (err: any) {
      toast.error("Process failed")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCopy = () => {
    const fullShortUrl = `${window.location.origin}/${shortCode}`
    navigator.clipboard.writeText(fullShortUrl)
    setCopied(true)
    toast.success("Link copied")
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownloadQr = () => {
    if (!qrRef.current) return
    const svgData = new XMLSerializer().serializeToString(qrRef.current)
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    const img = new Image()
    img.onload = () => {
      canvas.width = img.width + 40; canvas.height = img.height + 40
      if (ctx) { ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.drawImage(img, 20, 20); }
      const pngFile = canvas.toDataURL("image/png")
      const downloadLink = document.createElement("a"); downloadLink.download = `QR-${shortCode}.png`; downloadLink.href = `${pngFile}`; downloadLink.click();
    }
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)))
  }

  const fullShortUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/${shortCode}`

  return (
    <div className="min-h-[100dvh] bg-zinc-950 py-12 flex flex-col items-center animate-reveal">
      <div className="max-w-4xl mx-auto w-full px-6 text-left">
        <Link href="/" className="inline-flex items-center text-zinc-400 hover:text-zinc-100 transition-colors mb-12 group text-sm font-medium">
          <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>

        <div className="mb-12">
            <h1 className="text-4xl font-bold tracking-tighter text-zinc-100">URL Optimizer</h1>
            <p className="text-zinc-500 mt-2 font-medium">Transform long links into powerful, scannable short links.</p>
        </div>

        {!shortCode ? (
          <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-10">
            <form onSubmit={handleShorten} className="space-y-8">
              <div className="space-y-3">
                <label className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">Target Link</label>
                <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full bg-black border border-zinc-800 rounded-xl px-6 py-4 text-lg text-zinc-100 focus:outline-none focus:ring-4 focus:ring-zinc-100/5 transition-butter placeholder:text-zinc-800"
                    placeholder="https://example.com/very/long/path"
                />
              </div>

              <button
                type="submit"
                disabled={!url || isProcessing}
                className="w-full h-14 bg-zinc-50 text-zinc-950 font-bold rounded-xl text-lg transition-butter active:scale-[0.98] flex items-center justify-center"
              >
                {isProcessing ? <Loader2 size={20} className="animate-spin" /> : "Optimize URL"}
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-12 animate-reveal">
            <div className="flex flex-col md:flex-row items-center gap-12 p-10 bg-zinc-900/50 border border-zinc-800 rounded-3xl">
                <div className="flex-grow space-y-8 text-center md:text-left w-full">
                    <div className="space-y-2">
                        <div className="flex items-center justify-center md:justify-start space-x-3 text-zinc-100">
                            <CheckCircle2 size={24} className="text-blue-400" />
                            <h2 className="text-2xl font-bold tracking-tight text-zinc-100">Optimizer Active</h2>
                        </div>
                        <p className="text-zinc-500 text-sm font-medium">Link and QR code are ready for 24 hours.</p>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Universal Short Link</label>
                            <div className="relative flex items-center">
                                <input readOnly value={fullShortUrl} className="w-full bg-black border border-zinc-800 text-zinc-300 rounded-xl py-4 px-5 font-mono text-xs focus:outline-none pr-14" />
                                <button onClick={handleCopy} className="absolute right-3 p-2 text-zinc-500 hover:text-zinc-100 transition-colors">
                                    {copied ? <CheckCircle2 size={18} className="text-blue-400" /> : <Copy size={18} />}
                                </button>
                            </div>
                        </div>

                        <button onClick={handleDownloadQr} className="flex items-center text-zinc-100 text-xs font-bold uppercase tracking-widest hover:opacity-70 transition-opacity">
                            <DownloadCloud size={14} className="mr-2" /> Download high-res QR
                        </button>
                    </div>
                </div>

                <div className="shrink-0 bg-white p-6 rounded-3xl shadow-xl border border-zinc-100">
                    <QRCodeSVG 
                      value={fullShortUrl} 
                      size={180} 
                      level="H"
                      ref={qrRef}
                    />
                </div>
            </div>

            <div className="flex justify-center">
                <button onClick={() => setShortCode("")} className="text-zinc-500 hover:text-zinc-100 text-[11px] font-bold uppercase tracking-widest border-b border-zinc-900 pb-1 transition-colors">
                    Optimize New Link
                </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
