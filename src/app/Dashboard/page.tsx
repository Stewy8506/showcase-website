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
import { Sidebar } from "@/components/sidebar"
import { Calendar } from "@/components/calendar"
import { MedicationCard } from "@/components/medication-card"
import { HealthChart } from "@/components/health-chart"

export default function Dashboard() {
  return (
    <div className="dashboard-theme flex h-screen bg-background overflow-hidden font-sans">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Container */}
      <div className="flex-1 flex flex-col p-6 pl-0 gap-6 overflow-hidden">
        {/* Header */}
        <header className="flex items-center gap-12">
          <div className="flex items-center gap-4 min-w-fit">
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
          <section className="w-[420px] bg-white rounded-[3.5rem] p-10 flex flex-col gap-10 shadow-[0_20px_50px_rgba(0,0,0,0.03)] overflow-y-auto no-scrollbar">
            <Calendar />

            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-end px-2">
                <h3 className="font-bold text-[15px] text-primary">Today's Medications:</h3>
                <span className="font-black text-2xl italic text-primary">1/4</span>
              </div>

              <div className="flex flex-col gap-3">
                <MedicationCard name="Probiotic" dosage="250mg" time="04:00 PM" checked />
                <MedicationCard name="Loratadine" dosage="10mg" time="06:30 PM" checked />
                <MedicationCard name="Creatine" dosage="5mg" time="09:00 PM" checked />
                <div className="flex items-center gap-4 px-6 py-4 rounded-full bg-[#EDF1F5] opacity-50">
                  <div className="flex items-center gap-2 text-[9px] font-bold text-primary/60 uppercase italic">
                    <Clock className="w-2.5 h-2.5" />
                    11:00 AM
                  </div>
                  <span className="font-bold text-xs text-primary">Soframycin</span>
                </div>
              </div>

              <button className="mx-auto mt-1">
                <ChevronDown className="w-5 h-5 text-primary" />
              </button>
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
                ].map((action, i) => (
                  <button
                    key={i}
                    className="flex-1 aspect-square max-w-[180px] bg-white rounded-[2.5rem] p-8 flex flex-col items-center justify-center gap-4 shadow-sm hover:shadow-md transition-all border border-primary/5"
                  >
                    <action.icon className="w-10 h-10 text-primary" strokeWidth={1.2} />
                    <span className="font-bold text-[14px] text-primary whitespace-nowrap">{action.label}</span>
                  </button>
                ))}
                <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg cursor-pointer border border-primary/5 z-10">
                  <ChevronRight className="w-5 h-5 text-primary" />
                </div>
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
