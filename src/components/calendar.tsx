import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export function Calendar() {
  const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]
  const dates = Array.from({ length: 31 }, (_, i) => i + 1)
  const selectedDate = 19

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-8 px-4">
        <button className="text-primary/30">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="font-bold text-[14px] text-primary opacity-60">September 2021</span>
        <button className="text-primary/30">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-y-1 text-center">
        {days.map((day) => (
          <span key={day} className="text-[9px] font-bold text-primary/30 mb-2">
            {day}
          </span>
        ))}
        {dates.map((date) => (
          <div key={date} className="flex items-center justify-center">
            <span
              className={cn(
                "text-[12px] font-bold w-8 h-8 flex items-center justify-center rounded-full transition-all",
                date === selectedDate
                  ? "bg-primary text-white shadow-[0_5px_15px_rgba(25,60,60,0.4)]"
                  : "text-primary opacity-60",
              )}
            >
              {date}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}