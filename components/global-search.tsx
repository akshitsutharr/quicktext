"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search, ArrowRight, Loader2 } from "lucide-react"
import { resolveGlobalCode } from "@/app/actions/searchActions"

export function GlobalSearch() {
  const [code, setCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim()) return

    setIsLoading(true)
    setError("")

    try {
      const redirectUrl = await resolveGlobalCode(code)
      if (redirectUrl) {
        router.push(redirectUrl)
      } else {
        setError("Code not found or expired")
      }
    } catch (e) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto mb-16 relative z-20">
      <form onSubmit={handleSearch} className="relative group">
         <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
         </div>
         <input
           type="text"
           value={code}
           onChange={(e) => {
               setCode(e.target.value.replace(/\s/g, ''))
               setError("")
           }}
           placeholder="Enter a 5-digit code or short URL code..."
           className="block w-full bg-black/60 border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white rounded-full py-4 pl-14 pr-16 text-lg transition-all placeholder:text-gray-600 shadow-2xl backdrop-blur-md"
           maxLength={10}
         />
         <button
           type="submit"
           disabled={isLoading || !code}
           className="absolute inset-y-2 right-2 flex items-center justify-center bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-500 text-white w-12 rounded-full transition-colors"
         >
           {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowRight className="h-5 w-5" />}
         </button>
      </form>
      {error && (
        <p className="absolute -bottom-8 left-0 right-0 text-center text-red-500 text-sm font-medium">{error}</p>
      )}
    </div>
  )
}
