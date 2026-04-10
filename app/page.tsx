import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Share2, Download, CloudUpload, Link as LinkIcon } from "lucide-react"
import { GlobalSearch } from "@/components/global-search"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black text-white relative flex flex-col overflow-hidden">
      <h1 className="sr-only">QuickText — Ultimate Tool for Temporary Sharing</h1>

      {/* Modern dark animated background */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle at center, #1e3a8a 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      
      {/* Subtle glow effect */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[80vw] h-[50vh] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 flex flex-col min-h-screen">
        <nav className="border-b border-white/10 px-4 sm:px-6 py-4 glassmorphism">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center space-x-4 sm:space-x-8">
              <Link href="/">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-400">
                  QuickText
                </h1>
              </Link>
            </div>
            
            <div className="hidden md:flex items-center space-x-6 text-sm font-medium text-gray-400">
                <Link href="/" className="hover:text-blue-400 transition-colors">Home</Link>
                <Link href="/file/send" className="hover:text-blue-400 transition-colors">File Transfer</Link>
                <Link href="/url" className="hover:text-blue-400 transition-colors">Shortener</Link>
            </div>
          </div>
        </nav>

        <main className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="max-w-5xl mx-auto w-full py-12 sm:py-24">
            <div className="text-center space-y-6 sm:space-y-8 mb-16">
              <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight">
                Share Anything <br className="hidden sm:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-orange-500">Instantly.</span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto">
                Securely send text snippets, transfer large files, or shorten bulky URLs with zero friction.
              </p>
            </div>

            <GlobalSearch />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 auto-rows-fr">
              {/* Card 1 */}
              <Link href="/send" className="group block h-full">
                <div className="h-full bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10 hover:border-blue-500/50 transition-all duration-500 hover:scale-[1.02] flex flex-col">
                  <div className="w-14 h-14 bg-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Share2 size={28} />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Send Text</h3>
                  <p className="text-gray-400 leading-relaxed mb-6 flex-grow">
                    Write or paste your exact text or code, generate a unique 5-digit code, and share it securely. Auto-destructs in 1 hour.
                  </p>
                  <div className="text-blue-400 font-medium tracking-wide text-sm mt-auto inline-flex items-center">
                    Share Note <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </Link>
              
              {/* Card 2 */}
              <Link href="/receive" className="group block h-full">
                <div className="h-full bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10 hover:border-blue-500/50 transition-all duration-500 hover:scale-[1.02] flex flex-col">
                  <div className="w-14 h-14 bg-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Download size={28} />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Receive Text</h3>
                  <p className="text-gray-400 leading-relaxed mb-6 flex-grow">
                    Enter a previously generated 5-digit access code to instantly read, copy, or collaborate on a shared snippet.
                  </p>
                  <div className="text-blue-400 font-medium tracking-wide text-sm mt-auto inline-flex items-center">
                    Access Note <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </Link>

              {/* Card 3 */}
              <Link href="/file/send" className="group block h-full">
                <div className="h-full bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10 hover:border-orange-500/50 transition-all duration-500 hover:scale-[1.02] flex flex-col">
                  <div className="w-14 h-14 bg-orange-500/20 text-orange-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <CloudUpload size={28} />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 flex items-center">
                    Share File <span className="ml-3 text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded-full uppercase tracking-wider font-semibold">New</span>
                  </h3>
                  <p className="text-gray-400 leading-relaxed mb-6 flex-grow">
                    Upload documents or media up to 100MB. Receive a unique expiry code to share a temporary direct-download link.
                  </p>
                  <div className="text-orange-400 font-medium tracking-wide text-sm mt-auto inline-flex items-center">
                    Upload File <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </Link>

              {/* Card 4 */}
              <Link href="/url" className="group block h-full">
                <div className="h-full bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10 hover:border-orange-500/50 transition-all duration-500 hover:scale-[1.02] flex flex-col">
                  <div className="w-14 h-14 bg-orange-500/20 text-orange-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <LinkIcon size={28} />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 flex items-center">
                    Shorten URL <span className="ml-3 text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded-full uppercase tracking-wider font-semibold">New</span>
                  </h3>
                  <p className="text-gray-400 leading-relaxed mb-6 flex-grow">
                    Convert massive website URLs into elegant short links backed by beautiful scannable QR codes.
                  </p>
                  <div className="text-orange-400 font-medium tracking-wide text-sm mt-auto inline-flex items-center">
                    Create Link <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </Link>
            </div>
            
          </div>
        </main>

        <footer className="border-t border-white/10 mt-auto bg-black/50 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-gray-500 font-medium tracking-wide text-sm">
                Built with precision and minimalism.
              </p>
              <p className="text-gray-400 text-sm">
                Created by{" "}
                <a 
                  href="https://github.com/akshitsutharr" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-white hover:text-blue-400 transition-colors duration-300 ml-1 font-medium"
                >
                  Akshit Suthar
                </a>
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}