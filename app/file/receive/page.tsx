"use client"

import { useState, Suspense, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, FileBox, AlertCircle } from "lucide-react"
import { getSharedFile } from "@/app/actions/fileActions"

function FileReceiver() {
  const searchParams = useSearchParams()
  const initialCode = searchParams?.get("code") || ""

  const [code, setCode] = useState(initialCode)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [fileDetails, setFileDetails] = useState<{ file_name: string; file_url: string; size: number; expires_at: string } | null>(null)

  useEffect(() => {
    if (initialCode && initialCode.length === 5) {
      handleFetchFile()
    }
  }, [initialCode])

  const handleFetchFile = async () => {
    if (code.length !== 5) {
      setError("Please enter a valid 5-digit code")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const data = await getSharedFile(code)
      if (data) {
        setFileDetails(data)
      } else {
        setError("File not found or has expired")
      }
    } catch (e) {
      setError("An error occurred while fetching the file")
    } finally {
      setIsLoading(false)
    }
  }

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getTimeLeft = (expiresAt: string) => {
    const diff = new Date(expiresAt).getTime() - new Date().getTime()
    if (diff <= 0) return "Expired"
    const m = Math.floor(diff / 1000 / 60)
    return `${m} minutes left`
  }

  return (
    <div className="max-w-xl mx-auto mt-8 relative z-10 w-full px-4">
      <Link href="/" className="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-8 group">
        <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        Back to Home
      </Link>

      <h1 className="text-3xl sm:text-4xl font-bold mb-2 tracking-tight">Receive File</h1>
      <p className="text-gray-400 mb-8">Enter the 5-digit file code to access and download the securely shared file.</p>

      {!fileDetails ? (
        <div className="bg-[#111] border border-gray-800 rounded-3xl p-6 sm:p-8">
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
                  setCode(e.target.value.toUpperCase())
                  setError("")
                }}
                className="w-full bg-black border border-gray-700 text-white rounded-xl px-4 py-4 text-center text-4xl font-mono tracking-[0.5em] focus:outline-none focus:border-blue-500 transition-colors uppercase placeholder:text-gray-800"
                placeholder="XXXXX"
              />
            </div>
            
            {error && (
              <div className="flex items-center text-red-400 text-sm p-3 bg-red-400/10 rounded-xl">
                 <AlertCircle size={16} className="mr-2"/>
                 <span>{error}</span>
              </div>
            )}

            <Button
              onClick={handleFetchFile}
              disabled={code.length !== 5 || isLoading}
              className="w-full h-14 bg-white hover:bg-gray-200 text-black font-semibold rounded-xl text-lg transition-all"
            >
              {isLoading ? "Searching..." : "Access File"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-[#111] border border-gray-800 rounded-3xl p-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
          
          <div className="flex items-start space-x-6">
            <div className="w-16 h-16 bg-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center shrink-0">
               <FileBox size={32} />
            </div>
            <div className="overflow-hidden">
               <h3 className="text-2xl font-bold truncate pr-4 text-white mb-1" title={fileDetails.file_name}>{fileDetails.file_name}</h3>
               <div className="flex items-center space-x-3 text-sm text-gray-400 mb-6 font-medium">
                  <span className="bg-gray-800 px-3 py-1 rounded-full text-gray-300">{formatSize(fileDetails.size)}</span>
                  <span className="flex items-center text-amber-500/90 text-xs">
                     <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse mr-2" />
                     Expires in {getTimeLeft(fileDetails.expires_at)}
                  </span>
               </div>
            </div>
          </div>
          
          <a href={fileDetails.file_url} target="_blank" rel="noopener noreferrer" className="block w-full">
            <Button className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl text-lg shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all flex items-center justify-center space-x-2">
              <Download size={20} />
              <span>Download Securely</span>
            </Button>
          </a>
          
          <button onClick={() => setFileDetails(null)} className="mt-6 text-sm text-gray-500 hover:text-white transition-colors block text-center w-full focus:outline-none">
            Access a different file
          </button>
        </div>
      )}
    </div>
  )
}

export default function ReceiveFilePage() {
  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-6 md:p-8 font-sans flex flex-col items-center">
       {/* Background effect */}
       <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at center, #3f3f46 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
       <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[60vw] h-[50vh] bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />

       <Suspense fallback={<div className="mt-20 text-gray-500 animate-pulse">Loading interface...</div>}>
         <FileReceiver />
       </Suspense>
    </div>
  )
}
