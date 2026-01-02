"use client"
import { useState, useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export function Calendar({ onDateChange }: { onDateChange?: (date: Date) => void }) {
  const today = new Date()
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [selectedDate, setSelectedDate] = useState(today.getDate())

  // --- Resizable calendar width ---
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
    // clamp between compact and large calendar sizes
    const newWidth = Math.min(520, Math.max(220, e.clientX))
    setWidth(newWidth)
  }

  const isNarrow = width < 300

  const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]

  const monthStart = new Date(currentYear, currentMonth, 1)
  const nextMonthStart = new Date(currentYear, currentMonth + 1, 1)
  const daysInMonth = Math.round(
    (nextMonthStart.getTime() - monthStart.getTime()) / (1000 * 60 * 60 * 24)
  )

  // Limit dates to today's date only when on the current month
  const isCurrentMonth =
    currentYear === today.getFullYear() && currentMonth === today.getMonth()

  const dates = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  const monthLabel = monthStart.toLocaleString("default", {
    month: "long",
    year: "numeric",
  })

  const goPrevMonth = () => {
    const prev = new Date(currentYear, currentMonth - 1, 1)
    setCurrentYear(prev.getFullYear())
    setCurrentMonth(prev.getMonth())
    // reset selection when leaving month
    setSelectedDate(1)
  }

  const goNextMonth = () => {
    if (isCurrentMonth) return // do not go beyond today month
    const next = new Date(currentYear, currentMonth + 1, 1)
    // prevent going beyond today month boundary
    if (
      next.getFullYear() > today.getFullYear() ||
      (next.getFullYear() === today.getFullYear() &&
        next.getMonth() > today.getMonth())
    ) {
      return
    }
    setCurrentYear(next.getFullYear())
    setCurrentMonth(next.getMonth())
    setSelectedDate(
      next.getFullYear() === today.getFullYear() &&
        next.getMonth() === today.getMonth()
        ? today.getDate()
        : 1
    )
  }

  return (
    <div
      className="relative w-full sm:w-auto"
      style={{ width }}
      onMouseMove={handleResize}
      onMouseUp={stopResize}
      onMouseLeave={stopResize}
    >
      {/* Resize handle (right edge) */}
      <div
        onMouseDown={startResize}
        className="hidden sm:block absolute -right-1 top-0 h-full w-2 cursor-col-resize bg-transparent hover:bg-primary/10"
      />
      {/* Compact mobile view — only show highlighted date */}
      <div className="sm:hidden flex items-center justify-between px-3 py-2 rounded-2xl bg-white border border-primary/10 shadow-sm mb-4">
        <span className="text-sm font-bold text-primary">
          {monthLabel.split(" ")[0]} {selectedDate}, {currentYear}
        </span>
        <button
          onClick={() => setSelectedDate(today.getDate())}
          className="text-xs font-semibold text-primary/60 underline"
        >
          Today
        </button>
      </div>

      <div className={cn(
        "hidden sm:flex items-center justify-between",
        isNarrow ? "mb-4 px-2" : "mb-8 px-4"
      )}>
        <button
          onClick={goPrevMonth}
          className="text-primary/30 disabled:opacity-30"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <span className={cn(
          "font-bold text-primary opacity-60",
          isNarrow ? "text-[12px]" : "text-[14px]"
        )}>
          {monthLabel}
        </span>

        <button
          onClick={goNextMonth}
          className="text-primary/30 disabled:opacity-30"
          disabled={isCurrentMonth}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className={cn(
        "hidden sm:grid grid-cols-7 text-center",
        isNarrow ? "gap-y-[2px]" : "gap-y-1"
      )}>
        {days.map((day) => (
          <span
            key={day}
            className={cn(
              "font-bold text-primary/30",
              isNarrow ? "text-[8px] mb-1" : "text-[9px] mb-2"
            )}
          >
            {day}
          </span>
        ))}

        {dates.map((date) => {
          const isFutureDate = isCurrentMonth && date > today.getDate()
          return (
            <div key={date} className="flex items-center justify-center">
              <button
                onClick={() => {
                  setSelectedDate(date)
                  onDateChange?.(new Date(currentYear, currentMonth, date))
                }}
                disabled={isFutureDate}
                className={cn(
                  cn(
                    "font-bold flex items-center justify-center rounded-full transition-all",
                    isNarrow ? "text-[11px] w-7 h-7" : "text-[12px] w-8 h-8"
                  ),
                  isFutureDate
                    ? "text-primary/30 opacity-40"
                    : date === selectedDate
                    ? "bg-primary text-white shadow-[0_5px_15px_rgba(25,60,60,0.4)]"
                    : "text-primary opacity-60"
                )}
              >
                {date}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}