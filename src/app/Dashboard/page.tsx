"use client"
import { useState, useEffect, useRef } from "react"
import {
  Plus,
  FileText,
  MessageSquare,
  Link2,
  AlertCircle,
  X,
} from "lucide-react"
import { Sidebar } from "@/components/ui/sidebar"
import { Calendar } from "@/components/ui/calendar"
import { MedicationCard } from "@/components/ui/medication-card"
import { HealthChart } from "@/components/ui/health-chart"
import { SearchBar } from "@/components/ui/searchbar"
import { NotificationsBell } from "@/components/ui/notifications-bell"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { auth } from "@/lib/firebase"
import { onAuthStateChanged, signOut } from "firebase/auth"
import { AnimatePresence, motion } from "framer-motion"

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const profileRef = useRef<HTMLDivElement | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  useEffect(() => {
  function handleClickOutside(e: MouseEvent) {
    if (!profileRef.current) return

    // if click is outside profile dropdown → close it
    if (!profileRef.current.contains(e.target as Node)) {
      setShowProfileMenu(false)
    }
  }

  if (showProfileMenu) {
    document.addEventListener("mousedown", handleClickOutside)
  }

  return () => {
    document.removeEventListener("mousedown", handleClickOutside)
  }
}, [showProfileMenu])

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) {
        // not signed in → leave Dashboard
        router.push("/Landing")
        return
      }

      // signed in → allow access
      setUser(u)
    })

    return () => unsub()
  }, [router])
  const [medications, setMedications] = useState([
    { id: 4, name: "Soframycin", dosage: "Lotion", time: "11:00 AM", checked: false },
    { id: 1, name: "Probiotic", dosage: "250mg", time: "04:00 PM", checked: false },
    { id: 2, name: "Loratadine", dosage: "10mg", time: "06:30 PM", checked: false },
    { id: 3, name: "Creatine", dosage: "5mg", time: "09:00 PM", checked: false },

  ])
  // Helper: convert "hh:mm AM/PM" to minutes since midnight
  function timeToMinutes(time: string) {
    // expects format like "04:00 PM"
    const [t, period] = time.split(" ")
    const [h, m] = t.split(":").map(Number)

    let hours = h % 12
    if (period === "PM") hours += 12

    return hours * 60 + m
  }

  // Helper: get current time in minutes since midnight
  function nowToMinutes() {
    const d = new Date()
    return d.getHours() * 60 + d.getMinutes()
  }

  const toggleMedication = (id: number) => {
    setMedications(items => {
      const updated = items.map(m =>
        m.id === id ? { ...m, checked: !m.checked } : m
      )

      const reordered = [...updated].sort((a, b) => {
        // unchecked first, checked at the bottom
        if (a.checked !== b.checked) {
          return Number(a.checked) - Number(b.checked)
        }

        // when BOTH are unchecked → sort by time of consumption
        if (!a.checked && !b.checked) {
          return timeToMinutes(a.time) - timeToMinutes(b.time)
        }

        // when both are checked → preserve relative order
        return 0
      })

      return reordered
    })
  }
  const checkedCount = medications.filter((m) => m.checked).length
  const [notifications, setNotifications] = useState<any[]>([])
  const [missedMeds, setMissedMeds] = useState<any[]>([])

  useEffect(() => {
    function computeNotifications() {
      const now = nowToMinutes()

      const unchecked = medications.filter(m => !m.checked)

      const missed = unchecked
        .filter(m => timeToMinutes(m.time) < now)
        .sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time))
        setMissedMeds(missed)

      const upcoming = unchecked
        .filter(m => timeToMinutes(m.time) >= now)
        .sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time))

      const next = upcoming.length > 0 ? upcoming[0] : null

      const list: any[] = []

      // Missed medicines (red alert items)
      missed.forEach(m => {
        list.push({
          id: `missed-${m.id}`,
          title: "Missed Medicine",
          text: `${m.name} — scheduled at ${m.time}`,
          icon: "alert",
          missed: true,
        })
      })

      // Next upcoming medicine
      if (next) {
        list.push({
          id: `next-${next.id}`,
          title: "Next Medicine",
          text: `${next.name} at ${next.time}`,
          icon: "clock",
          missed: false,
        })
      }

      setNotifications(list)
    }

    // Compute now + refresh every minute
    computeNotifications()
    const t = setInterval(computeNotifications, 60 * 1000)
    return () => clearInterval(t)
  }, [medications, selectedDate])

  

  function handleCalendarDateChange(date: Date) {
    setSelectedDate(date)
    setMedications(items =>
      items.map(m => ({
        ...m,
        checked: false,
      }))
    )
  }

  const [showUploadModal, setShowUploadModal] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [showAddMenu, setShowAddMenu] = useState(false)

  function handleFileDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    const files = e.dataTransfer.files
    console.log("Dropped files:", files)

    // Simulate upload complete → close modal + redirect
    setShowUploadModal(false)
    router.push("/analysis")
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    console.log("Selected files:", files)

    // Simulate upload complete → close modal + redirect
    setShowUploadModal(false)
    router.push("/analysis")
  }

  // --- Resizable Left Column (Calendar + Medications) ---
  const [leftWidth, setLeftWidth] = useState(420)
  const leftResizeRef = useRef(false)

  function startLeftResize() {
    leftResizeRef.current = true
  }

  function stopLeftResize() {
    leftResizeRef.current = false
  }

  function handleLeftResize(e: MouseEvent | React.MouseEvent<HTMLDivElement>) {
    if (!leftResizeRef.current) return
    // clamp width range
    const clientX = (e as MouseEvent).clientX
    const newWidth = Math.min(640, Math.max(280, clientX))
    setLeftWidth(newWidth)
  }

  useEffect(() => {
    function onMove(e: MouseEvent) {
      handleLeftResize(e)
    }
    function onUp() {
      stopLeftResize()
    }

    if (leftResizeRef.current) {
      window.addEventListener("mousemove", onMove)
      window.addEventListener("mouseup", onUp)
    }

    return () => {
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("mouseup", onUp)
    }
  }, [leftWidth])

  // --- Resizable gap between title + count ---
  const [medHeaderGap, setMedHeaderGap] = useState(32)
  const medGapResizeRef = useRef(false)

  function startMedGapResize() {
    medGapResizeRef.current = true
  }

  function stopMedGapResize() {
    medGapResizeRef.current = false
  }

  function handleMedGapResize(e: MouseEvent | React.MouseEvent<HTMLDivElement>) {
    if (!medGapResizeRef.current) return
    const clientX = (e as MouseEvent).clientX
    // clamp spacer width
    const newGap = Math.min(160, Math.max(8, clientX - 200))
    setMedHeaderGap(newGap)
  }

  useEffect(() => {
    function onMove(e: MouseEvent) {
      handleMedGapResize(e)
    }
    function onUp() {
      stopMedGapResize()
    }

    if (medGapResizeRef.current) {
      window.addEventListener("mousemove", onMove)
      window.addEventListener("mouseup", onUp)
    }

    return () => {
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("mouseup", onUp)
    }
  }, [medHeaderGap])

  

  return (
    <div className="dashboard-theme flex h-screen bg-background overflow-x-auto overflow-y-auto font-sans">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Container */}
      <div className="flex-1 flex flex-col p-6 pl-0 gap-6 w-full overflow-y-auto">
        {/* Header */}
        <header className="relative flex items-center gap-6 w-full max-w-[1280px] mx-auto px-4">
    
          <div className="relative">
  <button
    onClick={() => setShowAddMenu(v => !v)}
    className="p-2 hover:bg-muted rounded-full transition-colors"
    aria-label="Open add menu"
  >
    <Plus className="w-8 h-8 text-primary" strokeWidth={1.5} />
  </button>

  {showAddMenu && (
    <div className="absolute left-0 mt-2 bg-white rounded-2xl shadow-lg border border-primary/10 w-50 z-50">
      
      <button
        onClick={() => {
          setShowAddMenu(false)
          console.log("Add medication")
        }}
        className="w-full text-left px-4 py-2 text-sm text-primary hover:bg-primary/10 rounded-t-2xl"
      >
        Add Medication
      </button>

      <button
        onClick={() => {
          setShowAddMenu(false)
          console.log("Add health information")
        }}
        className="w-full text-left px-4 py-2 text-sm text-primary hover:bg-primary/10 rounded-b-2xl"
      >
        Add Health Information
      </button>

    </div>
  )}
</div>

          <div className="flex-1 flex justify-center -ml-2 lg:-ml-20">
            <SearchBar />
          </div>

          <div className="flex items-center gap-6">
            <NotificationsBell
              notifications={notifications}
              setNotifications={setNotifications}
              hasMissed={notifications.some(n => n.missed)}
            />
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setShowProfileMenu((v) => !v)}
                className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-md"
                aria-label="Open profile menu"
              >
              <img
                src={
                  user?.photoURL ||
                  user?.providerData?.[0]?.photoURL ||
                  "/images/home-20page.png"
                }
                alt="Profile"
                className="w-full h-full object-cover"
              />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 bg-white rounded-2xl shadow-lg border border-primary/10 w-40 z-50">
                  <div className="px-4 py-3 border-b border-primary/10">
                    <p className="text-xs font-semibold text-primary line-clamp-2">
                      {user?.displayName || "User"}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setShowProfileMenu(false)
                      router.push("/profile")
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-primary hover:bg-primary/10"
                  >
                    View Profile
                  </button>

                  <button
                    onClick={async () => {
                      setShowProfileMenu(false)

                      try {
                        await signOut(auth)
                      } catch (err) {
                        console.error("Error during logout:", err)
                      } finally {
                        router.push("/Landing") // always redirect to landing
                      }
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-primary hover:bg-primary/10 rounded-b-2xl"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 flex gap-8 overflow-hidden">
          {/* Left Column - Card */}
          <section
            className="-ml-10 bg-white rounded-[3.5rem] p-10 flex flex-col gap-10 shadow-[0_20px_50px_rgba(0,0,0,0.03)] overflow-y-auto no-scrollbar relative flex-shrink min-w-[240px] w-full sm:max-w-[420px]"
          >
            <Calendar onDateChange={handleCalendarDateChange} />

            <div className="flex flex-col gap-6">
              <div className="flex items-end px-2">
                <h3 className="font-bold text-[15px] text-primary">Today's Medications:</h3>

                {/* Resizable spacer */}
                <div
                  className="relative cursor-col-resize select-none"
                  style={{ width: medHeaderGap }}
                  onMouseDown={startMedGapResize}
                >
                  <span className="absolute top-0 bottom-0 right-0 w-2 bg-transparent hover:bg-primary/10 rounded-full" />
                </div>

                <span className="font-black text-2xl italic text-primary">
                  {checkedCount}/{medications.length}
                </span>
              </div>

              <div className="flex flex-col gap-3">
                <AnimatePresence initial={false}>
                  {medications.map((m) => (
                    <motion.div
                      key={m.id}
                      layout
                      initial={{ opacity: 0, scale: 0.98, y: 4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.98, y: 4 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                    >
                    <MedicationCard
                      name={m.name}
                      dosage={m.dosage}
                      time={m.time}
                      checked={m.checked}
                      missed={missedMeds.some(x => x.id === m.id)}
                      onToggle={() => toggleMedication(m.id)}
                    />
                    </motion.div>
                  ))}
                </AnimatePresence>
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
                      onClick={() => setShowUploadModal(true)}
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
            <div className="flex-1 flex flex-col overflow-visible">
              <h2 className="text-3xl font-bold text-primary mb-6 tracking-tight">Health Overview</h2>
              <div className="flex-1 bg-white rounded-[3rem] p-8 shadow-sm border border-primary/5">
                <HealthChart />
              </div>
            </div>
          </section>
        </main>
        {missedMeds.length > 0 && (
  <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[90] px-6 py-3 rounded-2xl bg-red-600 text-white shadow-lg border border-red-400">
    <p className="text-sm font-semibold">
      You have {missedMeds.length} missed medication
      {missedMeds.length > 1 ? "s" : ""}. Please take them as soon as possible.
    </p>
  </div>
)}
        {showUploadModal && (
          <div
            className="fixed inset-0 z-[100] bg-black/30 backdrop-blur-sm flex items-center justify-center px-4"
            onClick={() => setShowUploadModal(false)}
          >
            <div
              className="relative bg-white rounded-3xl w-full max-w-lg p-6 shadow-xl border border-primary/10"
              onClick={(e) => e.stopPropagation()}
              onDragEnter={() => setDragActive(true)}
              onDragOver={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleFileDrop}
            >
              <button
                onClick={() => setShowUploadModal(false)}
                className="absolute top-3 right-3 p-2 rounded-full hover:bg-primary/10"
                aria-label="Close upload"
              >
                <X className="w-4 h-4 text-primary" strokeWidth={2} />
              </button>

              <h3 className="text-lg font-bold text-primary mb-4">Upload Report</h3>

              <div
                className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-colors p-8 ${
                  dragActive ? "border-primary bg-primary/5" : "border-primary/20"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileSelect}
                />

                <FileText className="w-10 h-10 text-primary mb-3" strokeWidth={1.5} />

                <p className="text-sm text-primary/80 text-center mb-2">
                  Drop your documents here
                </p>
                <p className="text-xs text-primary/60 mb-4">or</p>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 rounded-full bg-[#F0BF70] text-black font-semibold hover:opacity-90"
                >
                  Browse files
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
