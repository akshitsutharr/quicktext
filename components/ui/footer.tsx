import React from 'react'

export function Footer() {
  return (
    <footer className="border-t border-gray-800 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <div className="text-center">
          <p className="text-gray-400 font-medium tracking-wide text-xs sm:text-sm">
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
  )
}
