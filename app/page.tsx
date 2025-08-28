import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Share2, Download } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black text-white relative flex flex-col">
      <h1 className="sr-only">QuickText — Fast, Secure & Self-Destructing Text Sharing</h1>
      <p className="sr-only">
        Share code snippets and notes instantly using a 5-digit code or direct link. QuickText offers real-time collaboration, auto-expiration after 1 hour, no signup required, and works across devices.
      </p>

      {/* Dotted grid background */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: "radial-gradient(circle, #374151 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />

      <div className="relative z-10 flex flex-col min-h-screen">
        <nav className="border-b border-gray-800 px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between max-w-6xl mx-auto">
            <div className="flex items-center space-x-4 sm:space-x-8">
              <h1 className="text-lg sm:text-xl font-semibold">QuickText</h1>
              <div className="hidden md:flex items-center space-x-6 text-sm text-gray-400">
                <span>Tools</span>
                <span>/</span>
                <span>Text Sharing</span>
              </div>
            </div>
          </div>
        </nav>

        <main className="flex-1 flex items-center justify-center">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-16 w-full">
            <div className="text-center space-y-6 sm:space-y-8">
              <div className="space-y-4">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">QuickText</h1>
                <p className="text-base sm:text-lg lg:text-xl text-gray-400 max-w-2xl mx-auto px-4">
                  Share your text or code instantly with a simple 5-digit code. The fastest way to share text snippets
                  online.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4">
                <Link href="/send" className="w-full sm:w-auto">
                  <Button 
                    size="lg" 
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-3 text-base sm:text-lg font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  >
                    <Share2 className="mr-2 h-5 w-5" />
                    Send Text
                  </Button>
                </Link>
                <Link href="/receive" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto border-2 border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500 px-6 sm:px-8 py-3 text-base sm:text-lg font-medium bg-transparent shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  >
                    <Download className="mr-2 h-5 w-5" />
                    Receive Text
                  </Button>
                </Link>
              </div>

              <div className="mt-12 sm:mt-16 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 text-left px-4">
                <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 hover:bg-gray-900/70 transition-all duration-300 hover:scale-105 hover:shadow-lg">
                  <h3 className="text-lg font-semibold mb-3 text-center sm:text-left">Send Text</h3>
                  <p className="text-gray-400 text-center sm:text-left">
                    Write or paste your text, then generate a unique 5-digit code to share with others.
                  </p>
                </div>
                <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 hover:bg-gray-900/70 transition-all duration-300 hover:scale-105 hover:shadow-lg">
                  <h3 className="text-lg font-semibold mb-3 text-center sm:text-left">Receive Text</h3>
                  <p className="text-gray-400 text-center sm:text-left">Enter a 5-digit code to access, read, and collaborate on shared text.</p>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-800 mt-auto">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
            <div className="text-center">
              <p className="text-gray-400 font-medium tracking-wide text-sm sm:text-base">
                Made with{" "}
                <span className="text-red-500 animate-pulse inline-block hover:scale-125 transition-transform duration-300">
                  ❤️
                </span>{" "}
                by{" "}
                <a 
                  href="https://github.com/akshitsutharr" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-white font-semibold hover:text-blue-400 transition-colors duration-300 hover:underline"
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