"use client"
import { cn } from "@/lib/utils"
import Link from "next/link"

const navItems = [
  { name: "HOME", active: false },
  { name: "DASHBOARD", active: true },
  { name: "REPORTS", active: false },
  { name: "HELP", active: false },
]

import { useState, useRef } from "react"

export function Sidebar() {
  const [width, setWidth] = useState(160)
  const resizingRef = useRef(false)

  function startResize() {
    resizingRef.current = true
  }

  function stopResize() {
    resizingRef.current = false
  }

  function handleResize(e: React.MouseEvent<HTMLDivElement>) {
    if (!resizingRef.current) return
    const newWidth = Math.min(260, Math.max(80, e.clientX))
    setWidth(newWidth)
  }

  return (
    <div
      className="relative h-full flex flex-col justify-center gap-12 px-4 pt-6 flex-shrink-0 w-fit"
    >
      <div className="flex items-left gap-4 min-w-fit">
        <span className="font-black italic text-2xl tracking-tighter text-primary hidden sm:inline">
          Health<span className="text-[#F0BF70]">Care+</span>
        </span>
        <span className="sm:hidden font-black italic text-xl tracking-tight text-primary">
          HC+
        </span>
      </div>
      {navItems.map((item) =>
        item.name === "HOME" ? (
          <Link
            key="HOME"
            href="/Landing"
            className={cn(
              "text-[11px] font-bold tracking-[0.2em] text-left transition-colors",
              item.active
                ? "bg-primary text-white py-3 px-10 rounded-full -ml-12 w-[calc(100%+2rem)] shadow-[0_10px_20px_rgba(25,60,60,0.3)]"
                : "text-foreground/40 hover:text-foreground",
            )}
          >
            <span className="hidden sm:inline">{item.name}</span>
            <span className="sm:hidden text-xs font-bold">{item.name[0]}</span>
          </Link>
        ) : item.name === "HELP" ? (
          <Link
            key="HELP"
            href="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "text-[11px] font-bold tracking-[0.2em] text-left transition-colors",
              item.active
                ? "bg-primary text-white py-3 px-10 rounded-full -ml-12 w-[calc(100%+2rem)] shadow-[0_10px_20px_rgba(25,60,60,0.3)]"
                : "text-foreground/40 hover:text-foreground",
            )}
          >
            <span className="hidden sm:inline">{item.name}</span>
            <span className="sm:hidden text-xs font-bold">{item.name[0]}</span>
          </Link>
        ) : item.name === "REPORTS" ? (
          <Link
            key="REPORTS"
            href="https://github.com/Swapnendu003?tab=overview&from=2026-01-01&to=2026-01-25"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "text-[11px] font-bold tracking-[0.2em] text-left transition-colors",
              item.active
                ? "bg-primary text-white py-3 px-10 rounded-full -ml-12 w-[calc(100%+2rem)] shadow-[0_10px_20px_rgba(25,60,60,0.3)]"
                : "text-foreground/40 hover:text-foreground",
            )}
          >
            <span className="hidden sm:inline">{item.name}</span>
            <span className="sm:hidden text-xs font-bold">{item.name[0]}</span>
          </Link>
        ) : (
          <button
            key={item.name}
            className={cn(
              "text-[11px] font-bold tracking-[0.2em] text-left transition-colors",
              item.active
                ? "bg-primary text-white py-3 px-10 rounded-full -ml-12 w-[calc(100%+2rem)] shadow-[0_10px_20px_rgba(25,60,60,0.3)]"
                : "text-foreground/40 hover:text-foreground",
            )}
          >
            <span className="hidden sm:inline">{item.name}</span>
            <span className="sm:hidden text-xs font-bold">{item.name[0]}</span>
          </button>
        )
      )}
    </div>
  )
}