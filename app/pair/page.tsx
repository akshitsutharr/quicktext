"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { 
  ArrowLeft, Smartphone, Monitor, Copy, Send, 
  FileText, Download, Loader2, QrCode, X, Upload, File, Radio
} from "lucide-react"
import { createSession, joinSession, getSessionShares, shareToSession, shareFileToSession, getDownloadUrl } from "../actions/sessionActions"
import { generatePresignedUrl } from "../actions/fileActions"
import { supabase } from "@/lib/supabase"
import { QRCodeSVG } from "qrcode.react"
import { toast } from "sonner"
import { QRScanner } from "@/components/qr-scanner"

type SessionData = {
  sessionId: string
  sessionToken: string
  expiresAt: string
  pairingCode?: string | null
}

type ShareItem = {
  id: string
  type: "text" | "file"
  content: string
  created_at: string
}

function PairingInterface() {
  const searchParams = useSearchParams()
  const [session, setSession] = useState<SessionData | null>(null)
  const [pairingCode, setPairingCode] = useState<string | null>(null)
  const [inputCode, setInputCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState<ShareItem[]>([])
  const [textToShare, setTextToShare] = useState("")
  const [isJoining, setIsJoining] = useState(false)
  const [showScanner, setShowScanner] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const saved = localStorage.getItem("quicktext_session")
    if (saved) {
      const parsed = JSON.parse(saved)
      if (new Date(parsed.expiresAt) > new Date()) {
        setSession(parsed)
      } else {
        localStorage.removeItem("quicktext_session")
      }
    }
    const joinCode = searchParams.get("join")
    if (joinCode) { setInputCode(joinCode); setIsJoining(true); }
  }, [searchParams])

  useEffect(() => {
    if (!session) return
    const channel = supabase.channel(`session:${session.sessionId}`)
    channel.on("broadcast", { event: "share:item" }, ({ payload }) => {
        setItems(prev => [payload, ...prev])
        toast.success("Synchronized")
    }).subscribe()
    getSessionShares(session.sessionId, session.sessionToken).then(setItems)
    return () => { supabase.removeChannel(channel) }
  }, [session])

  const handleCreate = async () => {
    setLoading(true)
    try {
      const data = await createSession()
      setPairingCode(data.pairingCode)
      const sessionData = { sessionId: data.sessionId, sessionToken: data.sessionToken, expiresAt: data.expiresAt, pairingCode: data.pairingCode }
      setSession(sessionData)
      localStorage.setItem("quicktext_session", JSON.stringify(sessionData))
    } catch (error) {
      toast.error("Failed to host")
    } finally { setLoading(false) }
  }

  const handleJoin = async () => {
    if (inputCode.length < 6) return
    setLoading(true)
    try {
      const data = await joinSession(inputCode)
      const sessionData = { sessionId: data.sessionId, sessionToken: data.sessionToken, expiresAt: data.expiresAt, pairingCode: null }
      setSession(sessionData)
      localStorage.setItem("quicktext_session", JSON.stringify(sessionData))
      toast.success("Connected")
    } catch (error: any) {
      toast.error(error.message || "Failed to join")
    } finally { setLoading(false) }
  }

  const handleScan = (decodedText: string) => {
    setShowScanner(false)
    const parts = decodedText.split(/[=/]/)
    const scannedCode = parts[parts.length - 1].toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6)
    if (scannedCode.length === 6) {
        setInputCode(scannedCode)
        setLoading(true)
        joinSession(scannedCode).then(data => {
        const sessionData = { sessionId: data.sessionId, sessionToken: data.sessionToken, expiresAt: data.expiresAt, pairingCode: null }
            setSession(sessionData)
            localStorage.setItem("quicktext_session", JSON.stringify(sessionData))
            toast.success("Connected")
        }).catch(() => toast.error("Fail")).finally(() => setLoading(false))
    }
  }

  const handleShareText = async () => {
    if (!textToShare.trim() || !session) return
    setLoading(true)
    try {
      const newItem = await shareToSession(session.sessionId, session.sessionToken, "text", textToShare)
      const channel = supabase.channel(`session:${session.sessionId}`)
      await channel.send({ type: "broadcast", event: "share:item", payload: newItem })
      setItems(prev => [newItem, ...prev]); setTextToShare(""); toast.success("Broadcasted")
    } catch (error) { toast.error("Error") } finally { setLoading(false) }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0 || !session) return
    setLoading(true)
    try {
      const uploadedFiles = []
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const { signedUrl, fileKey } = await generatePresignedUrl(file.name, file.type, file.size)
        await fetch(signedUrl, { method: "PUT", body: file, headers: { "Content-Type": file.type } })
        uploadedFiles.push({ name: file.name, size: file.size, fileKey })
      }
      const newItem = await shareFileToSession(session.sessionId, session.sessionToken, uploadedFiles)
      const channel = supabase.channel(`session:${session.sessionId}`)
      await channel.send({ type: "broadcast", event: "share:item", payload: newItem })
      setItems(prev => [newItem, ...prev]); toast.success("Files Synced")
    } catch (error) { toast.error("Fail") } finally { setLoading(false); if (fileInputRef.current) fileInputRef.current.value = ""; }
  }

  const handleDownload = async (fileKey: string, fileName: string) => {
    try {
      const url = await getDownloadUrl(fileKey, fileName)
      window.open(url, "_blank")
    } catch (error) { toast.error("Link expired") }
  }

  const endSession = () => {
    localStorage.removeItem("quicktext_session")
    setSession(null); setPairingCode(null); setItems([]); toast.info("Disconnected")
  }

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="max-w-6xl mx-auto w-full px-6 animate-reveal">
        <div className="flex items-center justify-between mb-12">
            <Link href="/" className="inline-flex items-center text-zinc-500 hover:text-zinc-100 transition-colors group text-sm font-medium">
                <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                Back
            </Link>
            {session && (
              <div className="flex items-center space-x-2 bg-blue-500/10 border border-blue-500/25 px-3 py-1 rounded-full">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Active</span>
                </div>
            )}
        </div>

        {showScanner && <QRScanner onScan={handleScan} onClose={() => setShowScanner(false)} />}

        {!session ? (
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="text-left">
              <h1 className="text-4xl font-bold tracking-tighter text-zinc-100">Pairing Nexus</h1>
              <p className="text-zinc-500 mt-2 font-medium">Synchronize multiple devices via encrypted temporary link.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-10 text-left flex flex-col justify-between">
                <div className="mb-10">
                    <Monitor size={28} className="text-zinc-500 mb-6" />
                    <h3 className="text-lg font-bold mb-2 text-zinc-100">Host Session</h3>
                    <p className="text-zinc-500 text-sm leading-relaxed">Initialize a new host node. Any device with your code can join.</p>
                </div>
                <button onClick={handleCreate} disabled={loading} className="w-full bg-zinc-50 text-zinc-950 h-12 rounded-xl font-bold transition-butter active:scale-[0.98] hover:bg-white">
                    {loading ? <Loader2 size={18} className="animate-spin mx-auto" /> : "Initialize Host"}
                </button>
              </div>

              <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-10 text-left flex flex-col justify-between">
                <div className="mb-10">
                    <Smartphone size={28} className="text-zinc-500 mb-6" />
                    <h3 className="text-lg font-bold mb-2 text-zinc-100">Connect Device</h3>
                    <p className="text-zinc-500 text-sm leading-relaxed">Establish a satellite link to an active host via 6-digit key.</p>
                </div>
                {isJoining ? (
                  <div className="space-y-4">
                    <input value={inputCode} onChange={(e) => setInputCode(e.target.value.toUpperCase())} placeholder="······" className="w-full bg-black border border-zinc-800 h-14 text-center text-2xl font-bold font-mono tracking-[0.4em] rounded-xl focus:outline-none text-zinc-100 placeholder:text-zinc-900" maxLength={6} />
                    <div className="flex gap-2">
                        <button onClick={() => setIsJoining(false)} className="flex-1 text-zinc-500 font-bold text-xs uppercase transition-colors">Cancel</button>
                        <button onClick={handleJoin} disabled={loading || inputCode.length < 6} className="flex-[2] bg-zinc-50 text-zinc-950 h-12 rounded-xl font-bold transition-butter active:scale-[0.98] flex items-center justify-center hover:bg-white">
                            {loading ? <Loader2 size={18} className="animate-spin" /> : "Link"}
                        </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={() => setIsJoining(true)} className="flex-[3] bg-zinc-50 text-zinc-950 h-12 rounded-xl font-bold transition-butter active:scale-[0.98] hover:bg-white">Link Device</button>
                    <button onClick={() => setShowScanner(true)} className="flex-1 border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-100 h-12 rounded-xl flex items-center justify-center transition-butter">
                        <QrCode size={20} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : pairingCode ? (
          <div className="max-w-md mx-auto bg-zinc-950 border border-zinc-900 rounded-3xl p-12 text-center space-y-12 shadow-2xl ring-1 ring-white/5">
                <div className="space-y-2">
                    <h2 className="text-3xl font-bold tracking-tighter text-zinc-100">Scan to Link</h2>
                    <p className="text-zinc-500 text-sm font-medium uppercase tracking-widest text-[10px]">Secure pairing active</p>
                </div>
                <div className="bg-white p-6 rounded-2xl inline-block shadow-xl">
                  <QRCodeSVG value={`${window.location.origin}/pair?join=${pairingCode}`} size={200} level="H" />
                </div>
                <div className="space-y-4">
                    <p className="text-[10px] font-bold uppercase text-zinc-500">Manual Key</p>
                    <p className="text-4xl font-bold tracking-[0.2em] text-zinc-100 font-mono italic">
                    {pairingCode}
                    </p>
                </div>
                <button onClick={() => setPairingCode(null)} className="w-full h-14 bg-zinc-50 text-zinc-950 rounded-xl font-bold transition-butter hover:bg-white">Enter Terminal</button>
          </div>
        ) : (
          <div className="space-y-12">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-10 border-b border-zinc-900">
                <div className="space-y-2 text-left">
                    <h1 className="text-4xl font-bold tracking-tighter text-zinc-100">Nexus Console</h1>
                    <p className="text-zinc-500 text-[11px] font-bold uppercase tracking-widest flex items-center">
                      <Radio size={12} className="mr-2 text-blue-400 animate-pulse" /> Live Telemetry Synced
                    </p>
                    {session?.pairingCode && (
                      <div className="pt-3">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-2">Connection Key</p>
                        <div className="inline-flex items-center gap-2 bg-zinc-900/60 border border-zinc-800 rounded-lg px-3 py-2">
                          <span className="font-mono font-bold tracking-[0.28em] text-sm text-zinc-100 pl-1">{session.pairingCode}</span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(session.pairingCode || "")
                              toast.success("Code copied")
                            }}
                            className="h-7 w-7 rounded-md text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800/70 transition-colors flex items-center justify-center"
                            aria-label="Copy connection key"
                          >
                            <Copy size={14} />
                          </button>
                        </div>
                      </div>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    {session?.pairingCode && (
                      <button onClick={() => setPairingCode(session.pairingCode || null)} className="h-10 px-6 border border-orange-500/35 bg-zinc-900/50 hover:bg-orange-500/10 text-orange-300 hover:text-orange-200 rounded-lg text-xs font-bold transition-colors">Show QR</button>
                    )}
                    <button onClick={endSession} className="h-10 px-6 text-red-500 hover:bg-red-500/10 rounded-lg text-xs font-bold transition-colors">Terminate</button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 text-left">
              <div className="lg:col-span-4 space-y-10">
                <div className="space-y-6">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">Broadcast Stream</label>
                    <textarea value={textToShare} onChange={(e) => setTextToShare(e.target.value)} placeholder="Type snippet..." className="w-full bg-zinc-900/30 border border-zinc-800 min-h-[160px] rounded-xl focus:outline-none transition-butter font-mono text-sm p-5 text-zinc-100 placeholder:text-zinc-800" />
                    <button onClick={handleShareText} disabled={loading || !textToShare.trim()} className="w-full bg-zinc-50 text-zinc-950 h-12 rounded-xl font-bold text-[13px] transition-butter active:scale-95 flex items-center justify-center hover:bg-white">
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} className="mr-2" />}
                        Broadcast Text
                    </button>
                </div>
                <div className="pt-10 border-t border-zinc-900 space-y-6">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">Sync Objects</label>
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" multiple />
                    <button onClick={() => fileInputRef.current?.click()} disabled={loading} className="w-full border-2 border-dashed border-zinc-800 h-32 rounded-xl flex flex-col items-center justify-center gap-3 hover:bg-zinc-900/40 transition-colors group">
                        {loading ? <Loader2 size={20} className="animate-spin text-zinc-500" /> : <Upload size={24} className="text-zinc-700 group-hover:text-zinc-100 transition-colors" />}
                        <span className="text-[10px] font-bold text-zinc-600 group-hover:text-zinc-100 uppercase tracking-widest transition-colors">Broadcast Files</span>
                    </button>
                </div>
              </div>

              <div className="lg:col-span-8 space-y-8">
                <div className="flex items-center justify-between">
                    <h3 className="font-bold text-zinc-100 tracking-tight">Timeline</h3>
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{items.length} Synced</span>
                </div>
                {items.length === 0 ? (
                  <div className="border border-dashed border-zinc-900 rounded-3xl py-32 text-center">
                    <p className="text-zinc-600 font-medium text-sm">No telemetry streams active.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {items.map((item) => {
                      const isFile = item.type === "file"; let files = []
                      if (isFile) { try { files = JSON.parse(item.content) } catch (e) {} }
                      return (
                        <div key={item.id} className="p-6 bg-zinc-900/20 border border-zinc-900 rounded-2xl group transition-butter">
                          <div className="flex items-start justify-between mb-6 pb-4 border-b border-zinc-800/50">
                                <div className="flex items-center gap-4">
                                    {isFile ? <File size={20} className="text-zinc-500" /> : <FileText size={20} className="text-zinc-500" />}
                                    <div>
                                        <p className="font-bold text-[13px] text-zinc-100 italic">{isFile ? `${files.length} File(s) Synced` : "Text Snippet"}</p>
                                        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mt-0.5">{new Date(item.created_at).toLocaleTimeString()}</p>
                                    </div>
                                </div>
                                {!isFile && <button onClick={() => { navigator.clipboard.writeText(item.content); toast.success("Copied"); }} className="h-8 w-8 text-zinc-500 hover:text-zinc-100 transition-colors"><Copy size={16} /></button>}
                          </div>
                          {!isFile ? <div className="font-mono text-[13px] text-zinc-500 whitespace-pre-wrap break-all leading-relaxed">{item.content}</div> : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {Array.isArray(files) && files.map((file: any, idx: number) => (
                                        <div key={idx} className="flex items-center justify-between p-3 bg-black border border-zinc-800 rounded-xl">
                                            <div className="min-w-0 pr-4">
                                                <p className="text-[11px] font-bold text-zinc-100 truncate italic">{file.name}</p>
                                                <p className="text-[9px] text-zinc-500 font-bold uppercase">{formatSize(file.size)}</p>
                                            </div>
                                            <button onClick={() => handleDownload(file.fileKey, file.name)} className="h-8 w-8 bg-zinc-900 text-zinc-100 rounded-lg flex items-center justify-center transition-colors hover:bg-zinc-50 hover:text-zinc-950"><Download size={14} /></button>
                                        </div>
                                    ))}
                                </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
    </div>
  )
}

export default function PairPage() {
  return (
    <div className="min-h-[100dvh] bg-zinc-950 py-12 flex flex-col items-center">
      <Suspense fallback={<div className="mt-20 text-zinc-500 font-bold animate-pulse text-[11px] uppercase tracking-widest">Establishing Link...</div>}>
        <PairingInterface />
      </Suspense>
    </div>
  )
}
