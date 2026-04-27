"use client"

import { Typewriter } from "react-simple-typewriter"

export function LogoTypewriter() {
  return (
    <span className="text-xl font-bold tracking-tight text-zinc-50 inline-flex min-w-[9ch]">
      <Typewriter
        words={["Quicktext"]}
        loop={0}
        cursor
        cursorStyle="|"
        typeSpeed={120}
        deleteSpeed={70}
        delaySpeed={2500}
      />
    </span>
  )
}
