"use client"
import { useState } from "react"
import {
  Search,
  Bell,
  Plus,
  FileText,
  MessageSquare,
  Link2,
  AlertCircle,
  ChevronRight,
  ChevronDown,
  Clock,
} from "lucide-react"
import { Sidebar } from "@/components/ui/sidebar"
import { Calendar } from "@/components/ui/calendar"
import { MedicationCard } from "@/components/ui/medication-card"
import { HealthChart } from "@/components/ui/health-chart"
import Link from "next/link"

export default function Dashboard() {
  const [medications, setMedications] = useState([
    { id: 4, name: "Soframycin", dosage: "Lotion", time: "11:00 AM", checked: false },
    { id: 1, name: "Probiotic", dosage: "250mg", time: "04:00 PM", checked: false },
    { id: 2, name: "Loratadine", dosage: "10mg", time: "06:30 PM", checked: false },
    { id: 3, name: "Creatine", dosage: "5mg", time: "09:00 PM", checked: false },

  ])
  const toggleMedication = (id: number) => {
    setMedications((items) =>
      items.map((m) =>
        m.id === id ? { ...m, checked: !m.checked } : m
      )
    )
  }
  const checkedCount = medications.filter((m) => m.checked).length

  return (
    <div className="dashboard-theme flex h-screen bg-background overflow-x-auto overflow-y-auto font-sans">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Container */}
      <div className="flex-1 flex flex-col p-6 pl-0 gap-6 min-w-[1280px] overflow-y-auto">
        {/* Header */}
        <header className="flex items-center gap-12">
          <div className="flex items-left gap-4 min-w-fit">
            <span className="font-black italic text-2xl tracking-tighter">
              Health<span className="text-secondary">Care+</span>
            </span>
          </div>

          <button className="p-2 hover:bg-muted rounded-full transition-colors">
            <Plus className="w-8 h-8 text-primary" strokeWidth={1.5} />
          </button>

          <div className="flex-1 relative max-w-2xl">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-primary/20" />
            <input
              type="text"
              placeholder="Lorem ipsum dolor sit amet consectetur."
              className="w-full bg-white border border-primary/5 rounded-full py-4 pl-16 pr-8 text-sm italic focus:outline-none focus:ring-2 focus:ring-primary/10 shadow-sm"
            />
          </div>

          <div className="flex items-center gap-6 ml-auto">
            <div className="relative">
              <Bell className="w-6 h-6 text-primary" strokeWidth={1.5} />
              <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-secondary rounded-full border-2 border-background" />
            </div>
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-md">
              <img
                src="/images/home-20page.png"
                alt="Profile"
                className="w-full h-full object-cover scale-[3] translate-y-2"
              />
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 flex gap-8 overflow-hidden">
          {/* Left Column - Card */}
          <section className="-ml-6 w-[420px] bg-white rounded-[3.5rem] p-10 flex flex-col gap-10 shadow-[0_20px_50px_rgba(0,0,0,0.03)] overflow-y-auto no-scrollbar">
            <Calendar />

            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-end px-2">
                <h3 className="font-bold text-[15px] text-primary">Today's Medications:</h3>
                <span className="font-black text-2xl italic text-primary">{checkedCount}/{medications.length}</span>
              </div>

              <div className="flex flex-col gap-3">
                {medications.map((m) => (
                  <MedicationCard
                    key={m.id}
                    name={m.name}
                    dosage={m.dosage}
                    time={m.time}
                    checked={m.checked}
                    onToggle={() => toggleMedication(m.id)}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* Right Column */}
          <section className="flex-1 flex flex-col gap-10 py-2 overflow-hidden">
            {/* Quick Actions */}
            <div>
              <h2 className="text-3xl font-bold text-primary mb-8 tracking-tight">Quick Actions</h2>
              <div className="flex gap-5 overflow-x-visible relative">
                {[
                  { icon: FileText, label: "Upload Report" },
                  { icon: MessageSquare, label: "Symptoms Ai" },
                  { icon: Link2, label: "Medicine Centre" },
                  { icon: AlertCircle, label: "Reminders" },
                ].map((action, i) =>
                  action.label === "Symptoms Ai" ? (
                    <Link
                      key={i}
                      href="/chat"
                      className="flex-1 aspect-square max-w-[245px]"
                    >
                      <div className="relative overflow-hidden cursor-pointer group w-full h-full bg-white rounded-[2.5rem] p-8 flex flex-col items-center justify-center gap-4 shadow-sm hover:shadow-md transition-all border border-primary/5">
                        <span className="pointer-events-none absolute inset-0 rounded-[2.5rem] bg-primary/10 opacity-0 group-active:opacity-100 transition-opacity" />
                        <action.icon className="w-10 h-10 text-primary" strokeWidth={1.2} />
                        <span className="font-bold text-[14px] text-primary whitespace-nowrap">
                          {action.label}
                        </span>
                      </div>
                    </Link>
                  ) : action.label === "Medicine Centre" ? (
                    <Link
                      key={i}
                      href="/medicines"
                      className="flex-1 aspect-square max-w-[245px]"
                    >
                      <div className="relative overflow-hidden cursor-pointer group w-full h-full bg-white rounded-[2.5rem] p-8 flex flex-col items-center justify-center gap-4 shadow-sm hover:shadow-md transition-all border border-primary/5">
                        <span className="pointer-events-none absolute inset-0 rounded-[2.5rem] bg-primary/10 opacity-0 group-active:opacity-100 transition-opacity" />
                        <action.icon className="w-10 h-10 text-primary" strokeWidth={1.2} />
                        <span className="font-bold text-[14px] text-primary whitespace-nowrap">
                          {action.label}
                        </span>
                      </div>
                    </Link>
                  ) : action.label === "Reminders" ? (
                    <Link
                      key={i}
                      href="/reminders"
                      className="flex-1 aspect-square max-w-[245px]"
                    >
                      <div className="relative overflow-hidden cursor-pointer group w-full h-full bg-white rounded-[2.5rem] p-8 flex flex-col items-center justify-center gap-4 shadow-sm hover:shadow-md transition-all border border-primary/5">
                        <span className="pointer-events-none absolute inset-0 rounded-[2.5rem] bg-primary/10 opacity-0 group-active:opacity-100 transition-opacity" />
                        <action.icon className="w-10 h-10 text-primary" strokeWidth={1.2} />
                        <span className="font-bold text-[14px] text-primary whitespace-nowrap">
                          {action.label}
                        </span>
                      </div>
                    </Link>
                  ) : (
                    <button
                      key={i}
                      className="relative overflow-hidden cursor-pointer group flex-1 aspect-square max-w-[245px] bg-white rounded-[2.5rem] p-8 flex flex-col items-center justify-center gap-4 shadow-sm hover:shadow-md transition-all border border-primary/5"
                    >
                      <span className="pointer-events-none absolute inset-0 rounded-[2.5rem] bg-primary/10 opacity-0 group-active:opacity-100 transition-opacity" />
                      <action.icon className="w-10 h-10 text-primary" strokeWidth={1.2} />
                      <span className="font-bold text-[14px] text-primary whitespace-nowrap">
                        {action.label}
                      </span>
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Health Overview */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <h2 className="text-3xl font-bold text-primary mb-6 tracking-tight">Health Overview</h2>
              <div className="flex-1 bg-white rounded-[3rem] p-8 shadow-sm border border-primary/5">
                <HealthChart />
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}
