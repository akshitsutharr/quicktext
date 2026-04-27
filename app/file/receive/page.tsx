"use client"

import { useState, Suspense, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Download, FileBox, AlertCircle, Loader2 } from "lucide-react"
import { getSharedFiles } from "@/app/actions/fileActions"
import { toast } from "sonner"

type SharedFile = {
  file_name: string
  file_url: string
  size: number
  expires_at: string
}

function FileReceiver() {
  const searchParams = useSearchParams()
  const initialCode = searchParams?.get("code") || ""

  const [code, setCode] = useState(initialCode)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [fileDetails, setFileDetails] = useState<SharedFile[] | null>(null)

  useEffect(() => {
    if (initialCode && initialCode.length === 5) {
      handleFetchFile()
    }
  }, [initialCode])

  const handleFetchFile = async () => {
    if (code.length !== 5) {
      setError("Input 5-character share key")
      return
    }
    setIsLoading(true)
    setError("")
    try {
      const data = await getSharedFiles(code)
      if (data && data.length > 0) {
        setFileDetails(data)
        toast.success("Objects retrieved")
      } else {
        setError("Invalid Key or Expired Share")
      }
    } catch (e) {
      setError("Protocol mismatch. Try again.")
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

  const totalSize = (fileDetails || []).reduce((sum, file) => sum + file.size, 0)

  return (
    <div className="max-w-xl mx-auto w-full px-6 animate-reveal">
      <Link href="/" className="inline-flex items-center text-zinc-500 hover:text-zinc-100 transition-colors mb-12 group text-sm font-medium">
        <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
        Back to Home
      </Link>

      <div className="mb-12">
        <h1 className="text-4xl font-bold tracking-tighter text-zinc-100 italic">Retrieve <span className="text-zinc-500 not-italic">Objects.</span></h1>
        <p className="text-zinc-500 mt-2 font-medium">Temporary encrypted file streams.</p>
      </div>

      {!fileDetails ? (
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-10">
          <div className="space-y-8">
            <div className="space-y-3">
              <label className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">Access Key</label>
              <input
                type="text"
                maxLength={5}
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase())
                  setError("")
                }}
                onKeyDown={(e) => e.key === "Enter" && handleFetchFile()}
                className="w-full bg-black border border-zinc-800 rounded-xl py-5 text-center text-5xl font-bold font-mono tracking-[0.2em] text-zinc-100 focus:outline-none focus:ring-4 focus:ring-zinc-100/5 transition-butter placeholder:text-zinc-900"
                placeholder="·····"
              />
            </div>
            
            {error && <p className="text-xs font-semibold text-red-500 text-center uppercase tracking-widest">{error}</p>}

            <button
              onClick={handleFetchFile}
              disabled={code.length !== 5 || isLoading}
              className="w-full h-14 bg-zinc-50 text-zinc-950 disabled:opacity-20 font-bold rounded-xl flex items-center justify-center transition-butter active:scale-[0.98] hover:bg-white"
            >
              {isLoading ? <Loader2 size={20} className="animate-spin" /> : "Authorize Access"}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="p-8 bg-zinc-900/50 border border-zinc-800 rounded-3xl relative overflow-hidden">
             <div className="flex items-center space-x-5 mb-8">
                <div className="w-14 h-14 bg-zinc-50 text-zinc-950 rounded-xl flex items-center justify-center shadow-xl">
                   <FileBox size={24} />
                </div>
                <div>
                   <h3 className="text-xl font-bold text-zinc-100 tracking-tight italic">{fileDetails.length} Object{fileDetails.length !== 1 ? 's' : ''} Synced</h3>
                   <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">{formatSize(totalSize)} total payload</p>
                </div>
             </div>

             <div className="space-y-3">
                {fileDetails.map((file, index) => (
                    <a key={index} href={file.file_url} target="_blank" rel="noopener noreferrer" className="block w-full group">
                        <div className="flex items-center justify-between p-4 bg-black border border-zinc-800 rounded-xl hover:border-zinc-100 transition-butter">
                            <div className="min-w-0 pr-4">
                                <p className="text-xs font-bold text-zinc-100 truncate italic">{file.file_name}</p>
                                <p className="text-[10px] text-zinc-500 font-bold uppercase">{formatSize(file.size)}</p>
                            </div>
                            <div className="w-9 h-9 bg-zinc-900 text-zinc-100 rounded-lg flex items-center justify-center group-hover:bg-zinc-50 group-hover:text-zinc-950 transition-colors">
                                <Download size={16} />
                            </div>
                        </div>
                    </a>
                ))}
             </div>
             
             <button onClick={() => setFileDetails(null)} className="mt-10 text-[11px] font-bold text-zinc-500 hover:text-zinc-100 uppercase tracking-widest border-b border-zinc-800 hover:border-zinc-100 pb-1 transition-all block mx-auto">
                Access another code
             </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ReceiveFilePage() {
  return (
    <div className="min-h-[100dvh] bg-zinc-950 py-12 flex flex-col items-center">
       <Suspense fallback={<div className="mt-20 text-zinc-500 font-bold animate-pulse text-[11px] uppercase tracking-widest">Establishing Link...</div>}>
         <FileReceiver />
       </Suspense>
    </div>
  )
}
