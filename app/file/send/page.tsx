"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, UploadCloud, File, CheckCircle2, Copy } from "lucide-react"
import { generatePresignedUrl, completeFileShare } from "@/app/actions/fileActions"

export default function SendFilePage() {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [shareCode, setShareCode] = useState("")
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)
  const [isDragActive, setIsDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0])
    }
  }

  const validateAndSetFile = (selectedFile: File) => {
    setError("")
    if (selectedFile.size > 100 * 1024 * 1024) {
      setError("File exceeds 100MB limit. Please select a smaller file.")
      return
    }
    setFile(selectedFile)
  }

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragActive(true)
  }

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragActive(false)
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setIsUploading(true)
    setError("")
    setProgress(10)

    try {
      // 1. Get Presigned URL
      const { signedUrl, fileKey } = await generatePresignedUrl(file.name, file.type || "application/octet-stream", file.size)
      setProgress(30)

      // 2. Upload directly to R2
      const uploadRes = await fetch(signedUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type || "application/octet-stream",
        },
      })
      
      if (!uploadRes.ok) throw new Error("Failed to upload to storage")
      setProgress(80)

      // 3. Save Metadata to Supabase
      const code = await completeFileShare(file.name, fileKey, file.size)
      setProgress(100)
      setShareCode(code)
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during upload.")
    } finally {
      setIsUploading(false)
    }
  }

  const handleCopy = () => {
    const url = `${window.location.origin}/file/receive?code=${shareCode}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-6 md:p-8 font-sans">
      <div className="max-w-3xl mx-auto mt-8">
        <Link href="/" className="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-8 group">
          <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>

        <h1 className="text-3xl sm:text-4xl font-bold mb-2 tracking-tight">Share File</h1>
        <p className="text-gray-400 mb-8 max-w-lg">Upload any file up to 100MB to receive a secure, temporary direct-download link that auto-expires in 2 hours.</p>

        {!shareCode ? (
          <div className="bg-[#111] border border-gray-800 rounded-3xl p-6 sm:p-8">
            {!file ? (
              <div 
                className={`border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center transition-all ${
                  isDragActive ? "border-orange-500 bg-orange-500/10" : "border-gray-700 hover:border-gray-500 bg-black/50"
                }`}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
              >
                <UploadCloud className={`h-12 w-12 mb-4 ${isDragActive ? "text-orange-400" : "text-gray-500"}`} />
                <h3 className="text-xl font-medium mb-2">Drag and drop file here</h3>
                <p className="text-gray-500 text-sm mb-6 text-center">Limit 100MB per file. Automatically deleted after 2 hours.</p>
                <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                <Button onClick={() => fileInputRef.current?.click()} className="bg-white text-black hover:bg-gray-200">
                  Select File
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-black/50 border border-gray-800 rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4 truncate pr-4">
                    <div className="p-3 bg-orange-500/20 text-orange-400 rounded-xl">
                      <File size={24} />
                    </div>
                    <div className="truncate">
                      <p className="font-medium truncate">{file.name}</p>
                      <p className="text-sm text-gray-400">{formatSize(file.size)}</p>
                    </div>
                  </div>
                  {!isUploading && (
                    <button onClick={() => setFile(null)} className="text-gray-500 hover:text-white p-2 shrink-0">
                       ✕
                    </button>
                  )}
                </div>

                {isUploading && (
                  <div className="space-y-2">
                     <div className="flex justify-between text-sm text-gray-400">
                       <span>Uploading...</span>
                       <span>{progress}%</span>
                     </div>
                     <div className="w-full bg-gray-800 rounded-full h-2">
                        <div className="bg-emerald-500 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                     </div>
                  </div>
                )}

                {error && <p className="text-red-400 text-sm font-medium">{error}</p>}

                <Button 
                  onClick={handleUpload} 
                  disabled={isUploading} 
                  className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl text-lg relative overflow-hidden"
                >
                  {isUploading ? "Processing..." : "Generate Share Link"}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-8 text-center animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/30">
               <CheckCircle2 size={32} className="text-black" />
            </div>
            <h2 className="text-2xl font-bold mb-2">File Uploaded Successfully!</h2>
            <p className="text-emerald-200/70 mb-8 max-w-md mx-auto">Your file is now securely stored. Share the code or link below. It will automatically self-destruct in 2 hours.</p>
            
            <div className="bg-black/40 border border-white/10 rounded-2xl p-6 max-w-sm mx-auto space-y-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Share Code</p>
                <p className="text-5xl font-black tracking-widest text-emerald-400 font-mono">{shareCode}</p>
              </div>
              <Button onClick={handleCopy} variant="outline" className="w-full border-gray-700 bg-transparent text-white hover:bg-white hover:text-black hover:border-white transition-all h-12 rounded-xl block">
                {copied ? "Copied!" : <span className="flex items-center justify-center gap-2"><Copy size={18}/> Copy Direct Link</span>}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
