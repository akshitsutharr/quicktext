"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search, ArrowRight, Loader2, QrCode } from "lucide-react"
import { resolveGlobalCode } from "@/app/actions/searchActions"
import { QRScanner } from "./qr-scanner"

export function GlobalSearch() {
  const [code, setCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showScanner, setShowScanner] = useState(false)
  const router = useRouter()

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!code.trim()) return

    setIsLoading(true)
    setError("")

    try {
      const redirectUrl = await resolveGlobalCode(code)
      if (redirectUrl) {
        router.push(redirectUrl)
      } else {
        setError("Invalid or expired code")
      }
    } catch (e) {
      setError("An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleScan = (decodedText: string) => {
    setShowScanner(false)
    let scannedCode = ""
    if (decodedText.includes("code=")) {
        scannedCode = decodedText.split("code=")[1].slice(0, 6)
    } else {
        const parts = decodedText.split("/")
        scannedCode = parts[parts.length - 1].slice(0, 6)
    }

    if (scannedCode) {
        setCode(scannedCode)
        router.push(`/${scannedCode}`)
    }
  }

  return (
    <div className="w-full relative">
      {showScanner && <QRScanner onScan={handleScan} onClose={() => setShowScanner(false)} />}
      
      <form onSubmit={handleSearch} className="relative group flex items-center">
         <div className="absolute left-5 text-zinc-400 group-focus-within:text-zinc-900 dark:group-focus-within:text-zinc-100 transition-colors">
            <Search size={18} />
         </div>
         
         <input
           type="text"
           value={code}
           onChange={(e) => {
               setCode(e.target.value.toUpperCase().replace(/\s/g, ''))
               setError("")
           }}
           placeholder="Enter share code or link..."
           className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-2xl py-5 pl-14 pr-40 text-[15px] font-medium focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-butter placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
           maxLength={12}
         />

         <div className="absolute right-3 flex items-center space-x-2">
            <button
                type="button"
                onClick={() => setShowScanner(true)}
              className="h-10 w-10 rounded-xl border border-red-500/40 bg-red-500/12 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-butter flex items-center justify-center"
                title="Scan QR"
            >
                <QrCode size={21} strokeWidth={2.2} />
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="h-10 px-4 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-85 disabled:cursor-not-allowed rounded-xl text-[13px] font-bold transition-butter active:scale-95 flex items-center justify-center min-w-[90px]"
            >
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : "Access"}
            </button>
         </div>
      </form>

      {error && (
        <p className="absolute -bottom-7 left-0 right-0 text-center text-xs font-semibold text-red-500 animate-reveal">
            {error}
        </p>
      )}
    </div>
  )
}
