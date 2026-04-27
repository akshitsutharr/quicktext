"use client"

import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { Html5Qrcode } from "html5-qrcode"
import { X, Camera, AlertCircle, Loader2 } from "lucide-react"

interface QRScannerProps {
  onScan: (decodedText: string) => void
  onClose: () => void
}

export function QRScanner({ onScan, onClose }: QRScannerProps) {
  const [error, setError] = useState<{ type: string; message: string } | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)
  const [isMounted, setIsMounted] = useState(false)
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const containerId = "qr-reader-unique" // Unique ID to prevent duplication

  useEffect(() => {
    setIsMounted(true)
    return () => setIsMounted(false)
  }, [])

  useEffect(() => {
    if (!isMounted) return

    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = ""
    }
  }, [isMounted])

  useEffect(() => {
    let isMounted = true

    const startScanner = async () => {
      try {
        if (!isMounted) return
        setIsInitializing(true)
        
        // Ensure old instance is cleaned up before starting new one
        if (scannerRef.current) {
            try {
                if (scannerRef.current.isScanning) {
                    await scannerRef.current.stop()
                }
            } catch (e) {}
        }

        const html5QrCode = new Html5Qrcode(containerId)
        scannerRef.current = html5QrCode

        const config = { 
            fps: 20, 
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0
        }

        await html5QrCode.start(
          { facingMode: "environment" },
          config,
          (decodedText) => {
            if (isMounted) {
                onScan(decodedText)
                handleStop()
            }
          },
          () => {} // Frame errors are expected
        )
        
        if (isMounted) setError(null)
      } catch (err: any) {
        if (isMounted) {
            console.error("Scanner Error:", err)
            let type = "unknown"
            let message = "Could not access camera."
            if (err.name === "NotAllowedError") {
                type = "permission"
                message = "Camera access denied. Please enable it in settings."
            }
            setError({ type, message })
        }
      } finally {
        if (isMounted) setIsInitializing(false)
      }
    }

    const handleStop = async () => {
        if (scannerRef.current && scannerRef.current.isScanning) {
            try {
                await scannerRef.current.stop()
            } catch (e) {}
        }
    }

    // Delay start slightly to ensure DOM is ready and prevent immediate double-init
    const timeout = setTimeout(startScanner, 100)

    return () => {
      isMounted = false
      clearTimeout(timeout)
      handleStop()
    }
  }, [onScan])

  if (!isMounted) return null

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-xl p-6 animate-reveal">
      <div className="bg-zinc-950 border border-zinc-800 w-full max-w-sm rounded-[2rem] overflow-hidden shadow-2xl ring-1 ring-white/5">
        <div className="p-6 border-b border-zinc-900 flex items-center justify-between bg-zinc-950">
            <h3 className="font-bold flex items-center text-zinc-100 uppercase tracking-widest text-[10px]">
                <Camera size={14} className="mr-2 text-zinc-500" /> Scanner active
            </h3>
            <button onClick={onClose} className="p-1 text-zinc-500 hover:text-zinc-100 transition-colors"><X size={20} /></button>
        </div>

        <div className="p-8 text-center bg-zinc-950">
            {error ? (
                <div className="space-y-6">
                    <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto"><AlertCircle size={24} /></div>
                    <p className="text-sm font-bold text-zinc-100 px-4 leading-tight">{error.message}</p>
                    <button onClick={() => window.location.reload()} className="h-11 px-6 bg-zinc-50 text-zinc-950 font-bold rounded-xl text-xs uppercase tracking-widest transition-butter hover:bg-white">Retry</button>
                </div>
            ) : (
                <div className="relative aspect-square">
                    {isInitializing && (
                        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-zinc-950 rounded-2xl">
                            <Loader2 size={24} className="animate-spin text-zinc-500" />
                        </div>
                    )}
                    <div id={containerId} className="overflow-hidden rounded-2xl bg-zinc-900/50 border border-zinc-900 shadow-inner" />
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                        <div className="w-48 h-48 border-2 border-white/20 rounded-3xl" />
                    </div>
                </div>
            )}
            {!error && !isInitializing && <p className="mt-8 text-zinc-500 text-[10px] font-bold uppercase tracking-widest animate-pulse">Align QR marker inside frame</p>}
        </div>

        <div className="p-6 bg-zinc-900/20 border-t border-zinc-900 text-center">
             <button onClick={onClose} className="text-zinc-500 hover:text-zinc-100 text-[10px] font-black uppercase tracking-widest transition-colors">Cancel Scan</button>
        </div>
      </div>
    </div>,
    document.body
  )
}
