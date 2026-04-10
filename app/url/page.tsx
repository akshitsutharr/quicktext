"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Link as LinkIcon, QrCode, Copy, CheckCircle2, DownloadCloud } from "lucide-react"
import { shortenUrl } from "@/app/actions/urlActions"
import { QRCodeSVG } from "qrcode.react"

export default function UrlShortenerPage() {
  const [url, setUrl] = useState("")
  const [shortCode, setShortCode] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)
  const qrRef = useRef<SVGSVGElement>(null)

  const handleShorten = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!url) {
      setError("Please enter a valid URL")
      return
    }

    try {
      // Basic URL format validation
      new URL(url.startsWith('http') ? url : `https://${url}`)
    } catch {
      setError("Invalid URL format. Example: example.com")
      return
    }

    setIsProcessing(true)
    setError("")

    try {
      const code = await shortenUrl(url)
      setShortCode(code)
    } catch (err: any) {
      setError(err.message || "An error occurred while shortening the URL.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCopy = () => {
    const fullShortUrl = `${window.location.origin}/s/${shortCode}`
    navigator.clipboard.writeText(fullShortUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownloadQr = () => {
    if (!qrRef.current) return
    const svgData = new XMLSerializer().serializeToString(qrRef.current)
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    const img = new Image()
    
    img.onload = () => {
      canvas.width = img.width + 40
      canvas.height = img.height + 40
      
      // Add padding and white background
      if (ctx) {
         ctx.fillStyle = "#ffffff"
         ctx.fillRect(0, 0, canvas.width, canvas.height)
         ctx.drawImage(img, 20, 20)
      }
      
      const pngFile = canvas.toDataURL("image/png")
      const downloadLink = document.createElement("a")
      downloadLink.download = `QR-${shortCode}.png`
      downloadLink.href = `${pngFile}`
      downloadLink.click()
    }
    
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)))
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-6 md:p-8 font-sans flex flex-col items-center">
      {/* Background effect */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at center, #3f3f46 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[70vw] h-[50vh] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-2xl mx-auto mt-8 relative z-10 w-full px-4">
        <Link href="/" className="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-8 group">
          <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>

        <h1 className="text-3xl sm:text-4xl font-bold mb-2 tracking-tight">URL Shortener</h1>
        <p className="text-gray-400 mb-8 max-w-lg">Transform long links into powerful short URLs with customizable QR codes. Expiring securely in 24 hours.</p>

        {!shortCode ? (
          <div className="bg-[#111] border border-gray-800 rounded-3xl p-6 sm:p-8">
            <form onSubmit={handleShorten} className="space-y-6">
              <div>
                <label htmlFor="url" className="text-sm font-medium text-gray-400 mb-2 flex items-center">
                  <LinkIcon size={14} className="mr-2" />
                  Your Long Link
                </label>
                <div className="relative">
                   <input
                     id="url"
                     type="text"
                     value={url}
                     onChange={(e) => {
                       setUrl(e.target.value)
                       setError("")
                     }}
                     className="w-full bg-black border border-gray-700 text-white rounded-xl px-5 py-4 text-lg focus:outline-none focus:border-blue-500 transition-colors placeholder:text-gray-700"
                     placeholder="https://very-long-url-example.com/some/path/to/something"
                   />
                </div>
              </div>
              
              {error && (
                <p className="text-red-400 text-sm font-medium">{error}</p>
              )}

              <Button
                type="submit"
                disabled={!url || isProcessing}
                className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-lg transition-all"
              >
                {isProcessing ? "Optimizing URL..." : "Shorten URL"}
              </Button>
            </form>
          </div>
        ) : (
          <div className="bg-blue-500/5 border border-blue-500/20 rounded-3xl p-8 relative overflow-hidden group animate-in fade-in zoom-in duration-300">
            <div className="text-center mb-8">
               <div className="w-16 h-16 bg-blue-500/20 text-blue-400 flex items-center justify-center rounded-full mx-auto mb-4">
                  <CheckCircle2 size={32} />
               </div>
               <h2 className="text-2xl font-bold">Link Ready to Share</h2>
               <p className="text-gray-400 text-sm mt-1">Your shortened link and QR code are active for 24 hours.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-center bg-black/40 border border-white/10 rounded-2xl p-6 md:p-8">
               
               {/* QR Code Section */}
               <div className="flex flex-col items-center shrink-0">
                 <div className="bg-white p-3 rounded-xl mb-4 shadow-lg">
                    <QRCodeSVG 
                      value={`${window.location.origin}/s/${shortCode}`} 
                      size={150}
                      fgColor="#000000"
                      bgColor="#ffffff"
                      level="Q"
                      ref={qrRef}
                    />
                 </div>
                 <button onClick={handleDownloadQr} className="text-fuchsia-400 text-sm font-medium hover:text-fuchsia-300 flex items-center transition-colors">
                    <DownloadCloud size={16} className="mr-2" />
                    Download PNG
                 </button>
               </div>

               {/* Link Details Section */}
               <div className="flex-1 w-full space-y-6">
                 <div>
                   <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Short Link</p>
                   <div className="flex items-center gap-2">
                       <input 
                         readOnly 
                         value={`${window.location.origin}/s/${shortCode}`} 
                         className="w-full bg-black border border-gray-700 text-white rounded-lg px-4 py-3 text-sm focus:outline-none truncate" 
                       />
                       <Button onClick={handleCopy} variant="outline" className="shrink-0 h-[46px] border-gray-700 hover:bg-white hover:text-black hover:border-white transition-all bg-transparent">
                          {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
                       </Button>
                   </div>
                 </div>

                 <div className="pt-4 border-t border-gray-800">
                    <Button onClick={() => setShortCode("")} variant="ghost" className="text-gray-400 hover:text-white block w-full px-0 hover:bg-transparent tracking-wide text-sm">
                       Shorten another link
                    </Button>
                 </div>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
