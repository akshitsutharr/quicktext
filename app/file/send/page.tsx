"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import { ArrowLeft, UploadCloud, File, CheckCircle2, Copy, X, Loader2 } from "lucide-react"
import { generatePresignedUrl, completeFileShare } from "@/app/actions/fileActions"
import { QRCodeSVG } from "qrcode.react"
import { toast } from "sonner"

export default function SendFilePage() {
  const [files, setFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [shareCode, setShareCode] = useState("")
  const [copied, setCopied] = useState(false)
  const [isDragActive, setIsDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFiles(Array.from(e.target.files))
    }
  }

  const validateAndSetFiles = (selectedFiles: File[]) => {
    const oversized = selectedFiles.find((selectedFile) => selectedFile.size > 100 * 1024 * 1024)
    if (oversized) { toast.error("Object too large (100MB max)"); return; }
    setFiles(selectedFiles)
  }

  const handleUpload = async () => {
    if (files.length === 0) return
    setIsUploading(true)
    setProgress(5)
    try {
      const uploadedFiles: { fileName: string; fileKey: string; size: number }[] = []
      for (const [index, file] of files.entries()) {
        const { signedUrl, fileKey } = await generatePresignedUrl(file.name, file.type || "application/octet-stream", file.size)
        const uploadRes = await fetch(signedUrl, { method: "PUT", body: file, headers: { "Content-Type": file.type || "application/octet-stream" } })
        if (!uploadRes.ok) throw new Error(`Object fail: ${file.name}`)
        uploadedFiles.push({ fileName: file.name, fileKey, size: file.size })
        setProgress(5 + Math.round(((index + 1) / files.length) * 85))
      }
      const code = await completeFileShare(uploadedFiles)
      setShareCode(code)
      setProgress(100)
      toast.success("Broadcast established")
    } catch (err: any) {
      toast.error("Transfer protocol failed")
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveFile = (indexToRemove: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, index) => index !== indexToRemove))
  }

  const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/${shareCode}`

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    toast.success("Link copied")
    setTimeout(() => setCopied(false), 2000)
  }

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const totalSize = files.reduce((sum, currentFile) => sum + currentFile.size, 0)

  return (
    <div className="min-h-[100dvh] bg-zinc-950 py-12 flex flex-col items-center animate-reveal">
      <div className="max-w-4xl mx-auto w-full px-6">
        <Link href="/" className="inline-flex items-center text-zinc-500 hover:text-zinc-100 transition-colors mb-12 group text-sm font-medium">
          <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>

        <div className="mb-12 text-left">
            <h1 className="text-4xl font-bold tracking-tighter text-zinc-100">Broadcast Objects</h1>
            <p className="text-zinc-500 mt-2 font-medium">Encrypted file streams that expire in 2 hours.</p>
        </div>

        {!shareCode ? (
          <div className="space-y-8">
            <div 
              className={`relative border-2 border-dashed rounded-3xl p-16 flex flex-col items-center justify-center transition-butter cursor-pointer ${
                isDragActive ? "border-zinc-100 bg-zinc-900/40" : "border-zinc-800 hover:border-zinc-700 bg-zinc-900/20"
              }`}
              onDragOver={(e) => { e.preventDefault(); setIsDragActive(true); }}
              onDragLeave={() => setIsDragActive(false)}
              onDrop={(e) => { e.preventDefault(); setIsDragActive(false); if (e.dataTransfer.files) validateAndSetFiles(Array.from(e.dataTransfer.files)); }}
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadCloud size={40} className="text-zinc-700 mb-6" />
              <h3 className="text-xl font-bold mb-2 tracking-tight text-zinc-100">Sync objects to cloud</h3>
              <p className="text-zinc-500 text-sm font-medium">Up to 100MB per file. 2h temporal link.</p>
              <input type="file" multiple className="hidden" ref={fileInputRef} onChange={handleFileChange} />
              <button className="mt-8 bg-zinc-50 text-zinc-950 h-11 px-8 rounded-xl text-[13px] font-bold transition-butter active:scale-95">
                Browse Files
              </button>
            </div>

            {files.length > 0 && (
                <div className="space-y-6 animate-reveal">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                        {files.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-4 bg-zinc-900/40 border border-zinc-800 rounded-xl group">
                                <div className="flex items-center space-x-3 truncate min-w-0">
                                    <File size={18} className="text-zinc-500 shrink-0" />
                                    <div className="truncate">
                                        <p className="text-xs font-bold text-zinc-100 truncate italic">{file.name}</p>
                                        <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">{formatSize(file.size)}</p>
                                    </div>
                                </div>
                                {!isUploading && (
                                    <button onClick={(e) => { e.stopPropagation(); handleRemoveFile(index); }} className="p-1.5 text-zinc-600 hover:text-red-500 transition-colors">
                                        <X size={14} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6 border-t border-zinc-900">
                        <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                            {files.length} Object{files.length !== 1 ? 's' : ''} <span className="mx-2 text-zinc-800">/</span> <span className="text-zinc-100 italic">{formatSize(totalSize)}</span>
                        </div>
                        <button onClick={handleUpload} disabled={isUploading} className="w-full sm:w-auto h-14 px-12 bg-zinc-50 text-zinc-950 font-bold rounded-xl transition-butter active:scale-95 flex items-center justify-center">
                            {isUploading ? <Loader2 size={20} className="animate-spin" /> : "Broadcast Now"}
                        </button>
                    </div>

                    {isUploading && (
                        <div className="space-y-2.5">
                            <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-zinc-500">
                                <span>Synchronizing...</span>
                                <span>{progress}%</span>
                            </div>
                            <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden">
                                <div className="bg-zinc-100 h-full transition-all duration-300" style={{ width: `${progress}%` }} />
                            </div>
                        </div>
                    )}
                </div>
            )}
          </div>
        ) : (
          <div className="space-y-12 animate-reveal">
            <div className="flex flex-col md:flex-row items-center gap-12 p-10 bg-zinc-900/50 border border-zinc-800 rounded-3xl">
                <div className="flex-grow space-y-8 text-center md:text-left w-full">
                    <div className="space-y-2">
                        <div className="flex items-center justify-center md:justify-start space-x-3 text-zinc-100">
                            <CheckCircle2 size={24} className="text-blue-400" />
                            <h2 className="text-2xl font-bold tracking-tight text-zinc-100">Broadcasting</h2>
                        </div>
                        <p className="text-zinc-500 text-sm font-medium">Temporal objects expire in 120 minutes.</p>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Download URL</label>
                            <div className="relative flex items-center">
                                <input readOnly value={shareUrl} className="w-full bg-black border border-zinc-800 text-zinc-300 rounded-xl py-4 px-5 font-mono text-xs focus:outline-none pr-14" />
                                <button onClick={handleCopy} className="absolute right-3 p-2 text-zinc-500 hover:text-zinc-100 transition-colors">
                                    {copied ? <CheckCircle2 size={18} className="text-blue-400" /> : <Copy size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Access Key</label>
                            <div className="bg-black border border-zinc-800 rounded-xl py-4 text-center">
                                <p className="text-3xl font-bold font-mono tracking-[0.3em] text-zinc-100">{shareCode}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="shrink-0 bg-white p-6 rounded-3xl shadow-xl">
                    <QRCodeSVG value={shareUrl} size={180} level="H" />
                </div>
            </div>

            <div className="flex justify-center">
                <button onClick={() => { setShareCode(""); setFiles([]); }} className="text-zinc-500 hover:text-zinc-100 text-[11px] font-bold uppercase tracking-widest border-b border-zinc-900 pb-1 transition-colors">
                    Start New Transfer
                </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
