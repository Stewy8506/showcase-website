"use client"
import { useState, useEffect, useRef } from "react"
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
  X,
} from "lucide-react"
import { Sidebar } from "@/components/ui/sidebar"
import { Calendar } from "@/components/ui/calendar"
import { MedicationCard } from "@/components/ui/medication-card"
import { HealthChart } from "@/components/ui/health-chart"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { auth } from "@/lib/firebase"
import { onAuthStateChanged, signOut } from "firebase/auth"

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u || null)
    })
    return () => unsub()
  }, [])
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
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState([
    { id: 1, title: "Medication Reminder", text: "Probiotic at 4:00 PM", icon: "clock" },
    { id: 2, title: "Low Supply Alert", text: "Creatine running low", icon: "alert" },
  ])
  const [removingId, setRemovingId] = useState<number | null>(null)
  const [showMobileSearch, setShowMobileSearch] = useState(false)

  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

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

  const notifRef = useRef<HTMLDivElement>(null)

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

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false)
      }
    }

    if (showNotifications) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showNotifications])

  return (
    <div className="dashboard-theme flex h-screen bg-background overflow-x-auto overflow-y-auto font-sans">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Container */}
      <div className="flex-1 flex flex-col p-6 pl-0 gap-6 w-full overflow-y-auto">
        {/* Header */}
        <header className="relative flex items-center gap-6 w-full max-w-[1280px] mx-auto px-4">
    
          <button className="p-2 hover:bg-muted rounded-full transition-colors">
            <Plus className="w-8 h-8 text-primary" strokeWidth={1.5} />
          </button>

          <div className="flex-1 flex justify-center -ml-2 lg:-ml-20">
            {/* Desktop / tablet search bar */}
            <div className="relative max-w-2xl w-full min-w-0 hidden sm:block">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-primary/20" />
              <input
                type="text"
                placeholder="Lorem ipsum dolor sit amet consectetur."
                className="w-full bg-white border border-primary/5 rounded-full py-4 pl-16 pr-8 text-sm text-black placeholder:italic focus:outline-none focus:ring-2 focus:ring-primary/10 shadow-sm"
              />
            </div>

            {/* Mobile search icon */}
            <button
              onClick={() => setShowMobileSearch(true)}
              className="sm:hidden p-3 rounded-full hover:bg-muted active:bg-muted/70 transition-colors"
              aria-label="Open search"
            >
              <Search className="w-6 h-6 text-primary" strokeWidth={1.5} />
            </button>
          </div>

          {showMobileSearch && (
            <div className="sm:hidden fixed inset-0 z-50 bg-white/80 backdrop-blur-md p-4 flex items-start">
              <div className="relative w-full bg-white rounded-full border border-primary/10 shadow-sm">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/30" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Search…"
                  className="w-full rounded-full py-3 pl-12 pr-10 text-sm text-black placeholder:italic focus:outline-none"
                />
                <button
                  onClick={() => setShowMobileSearch(false)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-primary/5"
                  aria-label="Close search"
                >
                  <X className="w-4 h-4 text-primary" strokeWidth={2} />
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center gap-6">
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-full hover:bg-muted transition-colors"
              >
                <Bell className="w-6 h-6 text-primary" strokeWidth={1.5} />
              </button>
              {notifications.length > 0 && (
                <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-secondary rounded-full border-2 border-background" />
              )}

              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-3xl shadow-lg border border-primary/5 p-4 z-50">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-sm text-primary">Notifications</h4>
                    <button
                      onClick={() => setNotifications([])}
                      className="text-xs font-semibold text-primary/70 hover:text-primary"
                    >
                      Clear all
                    </button>
                  </div>

                  <div className="flex flex-col gap-3">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-primary/60 italic px-1">No notifications</p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`flex items-start gap-3 p-3 rounded-2xl bg-primary/5 transition-all duration-200 ${
                            removingId === n.id ? "opacity-0 scale-95 translate-y-1" : "opacity-100"
                          }`}
                        >
                          {n.icon === "clock" ? (
                            <Clock className="w-4 h-4 text-primary mt-0.5" strokeWidth={1.5} />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-primary mt-0.5" strokeWidth={1.5} />
                          )}
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-primary">{n.title}</p>
                            <p className="text-xs text-primary/70">{n.text}</p>
                          </div>
                          <button
                            onClick={() => {
                              setRemovingId(n.id)
                              setTimeout(() => {
                                setNotifications((prev) => prev.filter((x) => x.id !== n.id))
                                setRemovingId(null)
                              }, 180)
                            }}
                            className="shrink-0 p-1 rounded-full hover:bg-primary/20 active:bg-primary/30"
                            aria-label="Dismiss notification"
                          >
                            <X className="w-3 h-3 text-primary" strokeWidth={2} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  <button className="mt-3 w-full text-xs font-semibold text-primary/80 hover:text-primary transition-colors">
                    View all notifications
                  </button>
                </div>
              )}
            </div>
            <div className="relative">
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
