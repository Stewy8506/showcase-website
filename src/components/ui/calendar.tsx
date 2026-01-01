"use client"
import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export function Calendar() {
  const today = new Date()
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [selectedDate, setSelectedDate] = useState(today.getDate())

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
    <div className="w-full">
      <div className="flex items-center justify-between mb-8 px-4">
        <button
          onClick={goPrevMonth}
          className="text-primary/30 disabled:opacity-30"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <span className="font-bold text-[14px] text-primary opacity-60">
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

      <div className="grid grid-cols-7 gap-y-1 text-center">
        {days.map((day) => (
          <span
            key={day}
            className="text-[9px] font-bold text-primary/30 mb-2"
          >
            {day}
          </span>
        ))}

        {dates.map((date) => {
          const isFutureDate = isCurrentMonth && date > today.getDate()
          return (
            <div key={date} className="flex items-center justify-center">
              <button
                onClick={() => setSelectedDate(date)}
                disabled={isFutureDate}
                className={cn(
                  "text-[12px] font-bold w-8 h-8 flex items-center justify-center rounded-full transition-all",
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