import { cn } from "@/lib/utils"
import Link from "next/link"

const navItems = [
  { name: "HOME", active: false },
  { name: "DASHBOARD", active: true },
  { name: "REPORTS", active: false },
  { name: "HELP", active: false },
]

export function Sidebar() {
  return (
    <div className="w-40 h-full flex flex-col justify-center gap-12 px-4">
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
            HOME
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
            {item.name}
          </button>
        )
      )}
    </div>
  )
}