import Link from "next/link"
import Image from "next/image"
import { Share2, CloudUpload, Link as LinkIcon, Smartphone, ArrowRight, Shield, Clock, ScanLine, Sparkles } from "lucide-react"
import { GlobalSearch } from "@/components/global-search"
import { LogoTypewriter } from "@/components/logo-typewriter"

export default function HomePage() {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-zinc-950 text-zinc-50">
      <nav className="flex items-center justify-between px-8 py-10 max-w-7xl mx-auto w-full animate-reveal" style={{ animationDelay: '0s' }}>
        <Link href="/" className="flex items-center space-x-2.5">
          <Image
            src="/favicon.png"
            alt="Quicktext logo"
            width={32}
            height={32}
            className="w-8 h-8 rounded-lg logo-orbit"
            priority
          />
          <LogoTypewriter />
        </Link>
        <div className="hidden sm:flex items-center space-x-8 text-[13px] font-medium text-zinc-500">
          <Link href="/send" className="hover:text-zinc-100 transition-colors">Text</Link>
          <Link href="/file/send" className="hover:text-zinc-100 transition-colors">Files</Link>
          <Link href="/pair" className="hover:text-zinc-100 transition-colors">Pairing</Link>
          <Link href="/url" className="text-orange-300 font-semibold border-b border-orange-400/80 pb-0.5">Shorten</Link>
        </div>
      </nav>

      <main className="flex-grow flex flex-col items-center px-6 py-12 md:py-20 max-w-7xl mx-auto w-full">
        <header className="text-center space-y-6 mb-16 animate-reveal" style={{ animationDelay: '0.1s' }}>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-tight text-blue-400">
            Share anything, <br className="hidden md:block" /> instantly.
          </h1>
          <p className="text-zinc-500 text-lg md:text-xl max-w-xl mx-auto font-medium leading-relaxed tracking-tight">
            Quicktext lets you share text, files, and links across devices using short codes, QR scan, and instant pairing.
          </p>
          <div className="flex justify-center gap-2 flex-wrap pt-1">
            <span className="text-[10px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-300">new</span>
            <span className="text-[10px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300">pairing + qr scan live</span>
          </div>
        </header>

        <div className="w-full max-w-2xl mx-auto animate-reveal" style={{ animationDelay: '0.2s' }}>
          <GlobalSearch />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full mt-24 animate-reveal" style={{ animationDelay: '0.3s' }}>
          {/* Card 1: Text Share */}
          <Link href="/send" className="group block">
            <div className="feature-card h-full rounded-2xl p-8" data-accent="blue">
              <Share2 size={22} className="feature-card-icon mb-6" />
              <h3 className="feature-card-title text-lg font-bold mb-2 tracking-tight text-zinc-100 group-hover:text-orange-300 transition-colors">Text Share</h3>
              <p className="feature-card-copy text-sm leading-relaxed mb-4">Send notes, code, or messages with a short one-time code.</p>
              <div className="feature-card-cta flex items-center text-xs font-bold uppercase tracking-widest">
                Initialize <ArrowRight size={14} className="ml-2 transition-transform duration-500" />
              </div>
            </div>
          </Link>

          {/* Card 2: File Transfer */}
          <Link href="/file/send" className="group block">
            <div className="feature-card h-full rounded-2xl p-8" data-accent="orange">
              <CloudUpload size={22} className="feature-card-icon mb-6" />
              <h3 className="feature-card-title text-lg font-bold mb-2 tracking-tight text-zinc-100 group-hover:text-orange-300 transition-colors">File Share</h3>
              <p className="feature-card-copy text-sm leading-relaxed mb-4">Upload one or multiple files and open them on another device fast.</p>
              <div className="feature-card-cta flex items-center text-xs font-bold uppercase tracking-widest">
                Upload <ArrowRight size={14} className="ml-2 transition-transform duration-500" />
              </div>
            </div>
          </Link>

          {/* Card 3: URL Optimizer */}
          <Link href="/url" className="group block">
            <div className="feature-card h-full rounded-2xl p-8" data-accent="red">
              <LinkIcon size={22} className="feature-card-icon mb-6" />
              <h3 className="feature-card-title text-lg font-bold mb-2 tracking-tight text-zinc-100 group-hover:text-orange-300 transition-colors">Shorten URL</h3>
              <p className="feature-card-copy text-sm leading-relaxed mb-4">Create short links with QR codes so they are easy to share and scan.</p>
              <div className="feature-card-cta flex items-center text-xs font-bold uppercase tracking-widest">
                Optimize <ArrowRight size={14} className="ml-2 transition-transform duration-500" />
              </div>
            </div>
          </Link>

          {/* Card 4: Pairing Nexus */}
          <Link href="/pair" className="group block">
            <div className="feature-card h-full rounded-2xl p-8" data-accent="blue">
              <Smartphone size={22} className="feature-card-icon mb-6" />
              <h3 className="feature-card-title text-lg font-bold mb-2 tracking-tight text-zinc-100 group-hover:text-orange-300 transition-colors">Pairing</h3>
              <p className="feature-card-copy text-sm leading-relaxed mb-4">Pair two devices instantly to move content without extra setup.</p>
              <div className="feature-card-cta flex items-center text-xs font-bold uppercase tracking-widest">
                Connect Node <ArrowRight size={14} className="ml-2 transition-transform duration-500" />
              </div>
            </div>
          </Link>
        </div>

        <div className="w-full flex justify-center mt-10 animate-reveal" style={{ animationDelay: '0.34s' }}>
          <a href="/" className="h-11 px-6 rounded-xl border border-orange-500/35 bg-zinc-900/50 hover:bg-orange-500/10 text-orange-300 text-xs font-bold uppercase tracking-widest transition-butter inline-flex items-center">
            Show This Feature
          </a>
        </div>

        <section id="whats-new" className="w-full mt-16 animate-reveal" style={{ animationDelay: '0.38s' }}>
          <div className="max-w-6xl mx-auto border border-zinc-800/80 bg-zinc-900/30 rounded-2xl p-8 md:p-10">
            <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-orange-300">What's New</p>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-100 mt-2">Understand features in 10 seconds</h2>
              </div>
              <Link href="/pair" className="h-10 px-4 rounded-lg border border-orange-500/35 bg-zinc-900/50 hover:bg-orange-500/10 text-orange-300 text-xs font-bold uppercase tracking-widest transition-butter inline-flex items-center">
                Try Pairing
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="rounded-xl border border-zinc-800 bg-zinc-950/55 p-6 min-h-[180px]">
                <div className="flex items-center gap-2 mb-3">
                  <Smartphone size={15} className="text-blue-400" />
                  <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-400">Pairing</span>
                </div>
                <p className="text-[15px] text-zinc-300 leading-relaxed">Host on one device, enter a 6-digit key on another device, and sync instantly.</p>
              </div>

              <div className="rounded-xl border border-zinc-800 bg-zinc-950/55 p-6 min-h-[180px]">
                <div className="flex items-center gap-2 mb-3">
                  <ScanLine size={15} className="text-orange-300" />
                  <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-400">QR Scanning</span>
                </div>
                <p className="text-[15px] text-zinc-300 leading-relaxed">Use the scanner to join with QR code instantly, no manual typing needed.</p>
              </div>

              <div className="rounded-xl border border-zinc-800 bg-zinc-950/55 p-6 min-h-[180px]">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={15} className="text-red-400" />
                  <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-400">Smart Sharing</span>
                </div>
                <p className="text-[15px] text-zinc-300 leading-relaxed">Share text, files, or links with temporary access codes and auto-expiry.</p>
              </div>
            </div>
          </div>
        </section>

        <footer className="w-full max-w-7xl mt-40 pt-10 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-6 text-zinc-500 text-[13px] font-medium animate-reveal" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-center space-x-3">
             <span className="font-bold text-zinc-100 tracking-tight">Quicktext</span>
             <span className="opacity-40">/</span>
             <span>&copy; 2026 Developed by Akshit Suthar</span>
          </div>
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <Shield size={14} className="text-blue-400" />
              <span>Encrypted Access</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock size={14} className="text-orange-400" />
              <span>Auto-Destruct</span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}
