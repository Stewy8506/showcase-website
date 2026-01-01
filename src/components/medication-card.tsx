import { Check, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface MedicationCardProps {
  name: string
  dosage: string
  time: string
  checked?: boolean
}

export function MedicationCard({ name, dosage, time, checked = false }: MedicationCardProps) {
  return (
    <div className="flex items-stretch rounded-full bg-[#EDF1F5] overflow-hidden shadow-sm group">
      <div className="flex-1 py-4 px-8 flex flex-col justify-center">
        <span className="font-bold text-sm text-primary">
          {name}, {dosage}
        </span>
        <div className="flex items-center gap-1 text-[10px] font-bold text-primary/60 mt-1 uppercase">
          <Clock className="w-3 h-3" />
          {time}
        </div>
      </div>
      <div
        className={cn(
          "w-16 flex items-center justify-center transition-colors",
          checked ? "bg-secondary" : "bg-transparent border-l border-white/20",
        )}
      >
        {checked && <Check className="w-5 h-5 text-primary" strokeWidth={3} />}
      </div>
    </div>
  )
}