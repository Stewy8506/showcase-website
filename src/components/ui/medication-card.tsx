"use client"
import { Check, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState, useRef } from "react"

interface MedicationCardProps {
  name: string
  dosage: string
  time: string
  checked?: boolean
  missed?: boolean
  onToggle?: () => void
}

export function MedicationCard({ name, dosage, time, checked = false, missed = false, onToggle }: MedicationCardProps) {
  // --- Resizable medication card width ---
  const [width, setWidth] = useState(360)
  const resizingRef = useRef(false)

  function startResize() {
    resizingRef.current = true
  }

  function stopResize() {
    resizingRef.current = false
  }

  function handleResize(e: React.MouseEvent<HTMLDivElement>) {
    if (!resizingRef.current) return
    const newWidth = Math.min(520, Math.max(220, e.clientX))
    setWidth(newWidth)
  }
  const isNarrow = width < 260

  return (
    <div
      className="relative sm:w-auto"
      style={{ width }}
      onMouseMove={handleResize}
      onMouseUp={stopResize}
      onMouseLeave={stopResize}
    >
      {/* Resize handle (right edge — shown on sm and up) */}
      <div
        onMouseDown={startResize}
        className="hidden sm:block absolute -right-1 top-0 h-full w-2 cursor-col-resize bg-transparent hover:bg-primary/10"
      />

      {/* Compact mobile view — only name + tick box */}
      <div
        className={cn(
          "sm:hidden flex items-center justify-between rounded-full bg-[#EDF1F5] overflow-hidden px-4 py-3 border-2 transition-shadow",
          !checked && missed
            ? "border-red-500 shadow-[0_0_0_4px_rgba(239,68,68,0.45)]"
            : "border-transparent shadow-none"
        )}
      >
        <span className="font-bold text-sm text-primary truncate">{name}</span>
        <button
          onClick={() => onToggle?.()}
          className={cn(
            "ml-3 w-8 h-8 flex items-center justify-center rounded-full transition-colors border",
            checked
              ? "bg-transparent border-primary/30"
              : "bg-[#F0BF70] border-transparent"
          )}
          aria-label="Toggle medication"
        >
          {!checked && <Check className="w-4 h-4 text-black" strokeWidth={3} />}
        </button>
      </div>

      {/* Full card — visible on sm and up */}
      {checked ? (
        <div
          onClick={() => onToggle?.()}
          className={cn(
            "hidden sm:flex items-center rounded-full bg-[#EDF1F5] opacity-50 cursor-pointer",
            isNarrow ? "gap-2 px-4 py-3" : "gap-4 px-6 py-4"
          )}
        >
          <div className="flex items-center gap-2 text-[9px] font-bold text-primary/60 uppercase italic">
            <Clock className="w-2.5 h-2.5" />
            {time}
          </div>
          <span className="font-bold text-xs text-primary">{name}</span>
        </div>
      ) : (
        <div
          className={cn(
            "hidden sm:flex items-stretch rounded-full bg-[#EDF1F5] overflow-hidden group border-2 transition-shadow",
            !checked && missed
              ? "border-red-500 shadow-[0_0_0_5px_rgba(239,68,68,0.15)]"
              : "border-transparent shadow-none"
          )}
        >
          <div className={cn("flex-1 flex flex-col justify-center", isNarrow ? "py-3 px-4" : "py-4 px-8")}>
            <span className="font-bold text-sm text-primary truncate">
              {name}, {dosage}
            </span>
            <div className="flex items-center gap-1 text-[10px] font-bold text-primary/60 mt-1 uppercase">
              <Clock className="w-3 h-3" />
              {time}
            </div>
          </div>
          <div
            onClick={() => onToggle?.()}
            className={cn(
              (isNarrow ? "w-12" : "w-16"),
              "flex items-center justify-center transition-colors cursor-pointer border-l",
              checked
                ? "bg-transparent border-white/20"
                : "bg-[#F0BF70] border-transparent"
            )}
          >
            {!checked && <Check className="w-5 h-5 text-black" strokeWidth={3} />}
          </div>
        </div>
      )}
    </div>
  )
}