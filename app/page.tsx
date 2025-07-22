import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Share2, Download } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black text-white relative">
      {/* Dotted grid background */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: "radial-gradient(circle, #374151 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />

      <div className="relative z-10">
        <nav className="border-b border-gray-800 px-6 py-4">
          <div className="flex items-center justify-between max-w-6xl mx-auto">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-semibold">QuickText</h1>
              <div className="hidden md:flex items-center space-x-6 text-sm text-gray-400">
                <span>Tools</span>
                <span>/</span>
                <span>Text Sharing</span>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-4xl mx-auto px-6 py-16">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl font-bold">QuickText</h1>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Share your text or code instantly with a simple 5-digit code. The fastest way to share text snippets
                online.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/send">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg">
                  <Share2 className="mr-2 h-5 w-5" />
                  Send Text
                </Button>
              </Link>
              <Link href="/receive">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-800 px-8 py-3 text-lg bg-transparent"
                >
                  <Download className="mr-2 h-5 w-5" />
                  Receive Text
                </Button>
              </Link>
            </div>

            <div className="mt-16 grid md:grid-cols-2 gap-8 text-left">
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-3">Send Text</h3>
                <p className="text-gray-400">
                  Write or paste your text, then generate a unique 5-digit code to share with others.
                </p>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-3">Receive Text</h3>
                <p className="text-gray-400">Enter a 5-digit code to access, read, and collaborate on shared text.</p>
              </div>
            </div>
          </div>
          <div className="max-w-6xl mx-auto px-6 pt-16 pb-8">
            <div className="text-center">
              <p
                className="text-gray-400 font-medium tracking-wide"
                style={{ fontFamily: "Inter, system-ui, sans-serif" }}
              >
                Made with <span className="text-red-500 animate-pulse">❤️</span> by{" "}
                <a href="https://github.com/akshitsuthar" target="_blank" rel="noopener noreferrer">
                  <span className="text-white font-semibold"> Akshit Suthar</span>
                </a>
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}