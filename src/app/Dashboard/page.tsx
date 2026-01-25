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
import {
  doc,
  onSnapshot,
  getDoc,
  collection,
  addDoc,
  Timestamp,
  query,
  where,
  updateDoc,
} from "firebase/firestore"
import { migrateAuthUserToProfile } from "@/lib/firestore/users"
import { db } from "@/lib/firebase"

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const profileRef = useRef<HTMLDivElement | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  const firstName =
    profile?.firstName ??
    user?.displayName?.split(" ")[0] ??
    "Unnamed User"

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
    let profileUnsub: (() => void) | null = null

    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) {
        setUser(null)
        setProfile(null)
        router.push("/Landing")
        return
      }

      setUser(u)

      // Ensure profile exists before listening (prevents permission-denied)
      const ref = doc(db, "users", u.uid)

      getDoc(ref)
        .then(async (snap) => {
          if (!snap.exists()) {
            try {
              // create profile for legacy / first-time users
              await migrateAuthUserToProfile(u)
            } catch (err) {
              console.error("Failed to create Firestore profile:", err)
            }
          }

          // Realtime listener (safe after profile exists)
          profileUnsub = onSnapshot(ref, (s) => {
            setProfile(s.exists() ? s.data() : null)
          })
        })
        .catch((err) => {
          console.error("Error checking user profile:", err)
        })
    })

    return () => {
      if (profileUnsub) profileUnsub()
      unsub()
    }
  }, [router])
  type FirestoreMedication = {
    id: string
    name: string
    dosage: string
    frequency: string
    time: string        // e.g. "08:00"
    checked: boolean
    date: Timestamp
  }

  const [medications, setMedications] = useState<FirestoreMedication[]>([])
  // --- Firestore-backed medication checked count ---
  const checkedCount = medications.filter((m) => m.checked).length
  const [notifications, setNotifications] = useState<any[]>([])
  const [missedMeds, setMissedMeds] = useState<any[]>([])

  // Remove time-based missed/notification logic for now (to be restored later)

  function handleCalendarDateChange(date: Date) {
    setSelectedDate(date)
    // No need to reset checked state, Firestore will load correct data
  }

  // Firestore: Fetch medications for user + selectedDate
  useEffect(() => {
    if (!user || !selectedDate) return

    const start = new Date(selectedDate)
    start.setHours(0, 0, 0, 0)

    const end = new Date(selectedDate)
    end.setHours(23, 59, 59, 999)

    const medsRef = collection(db, "users", user.uid, "medical")

    const q = query(
      medsRef,
      where("date", ">=", Timestamp.fromDate(start)),
      where("date", "<=", Timestamp.fromDate(end))
    )

    const unsub = onSnapshot(q, snap => {
      const list = snap.docs.map(d => ({
        id: d.id,
        ...d.data(),
      })) as FirestoreMedication[]

      setMedications(list)
    })

    return () => unsub()
  }, [user, selectedDate])

  // Toggle medication: update Firestore only
  const toggleMedication = async (id: string) => {
    if (!user) return

    const target = medications.find(m => m.id === id)
    if (!target) return

    try {
      await updateDoc(
        doc(db, "users", user.uid, "medical", id),
        { checked: !target.checked }
      )
    } catch (err) {
      console.error("Failed to toggle medication:", err)
    }
  }

  const [showUploadModal, setShowUploadModal] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [showAddMenu, setShowAddMenu] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<string | null>(null)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  async function saveMedicineToFirestore(
    med: {
      name: string
      dosage: string
      frequency: string
      duration: string
      instructions: string
    }
  ) {
    if (!user) return

    try {
      await addDoc(collection(db, "users", user.uid, "medical"), {
        name: med.name,
        dosage: med.dosage,
        frequency: med.frequency,
        time: "08:00", // default time (can be edited later)
        duration: med.duration,
        instructions: med.instructions,
        checked: false,
        date: Timestamp.fromDate(selectedDate),
        createdAt: Timestamp.now(),
      })
    } catch (err) {
      console.error("Failed to save medicine:", err)
      alert("Failed to save medicine to Firestore")
    }
  }
  // --- Time helpers ---
  function timeToMinutes(time?: string) {
    if (!time || typeof time !== "string") {
      // default to end of day so it is neither missed nor upcoming
      return 24 * 60
    }

    const [h, m] = time.split(":").map(Number)

    if (isNaN(h) || isNaN(m)) {
      return 24 * 60
    }

    return h * 60 + m
  }

  function nowToMinutes() {
    const d = new Date()
    return d.getHours() * 60 + d.getMinutes()
  }

  // --- Notification computation ---
  useEffect(() => {
    if (!medications.length) {
      setNotifications([])
      setMissedMeds([])
      return
    }

    const now = nowToMinutes()
    const unchecked = medications.filter(m => !m.checked)

    const missed = unchecked.filter(
      m => m.time && timeToMinutes(m.time) < now
    )

    const upcoming = unchecked
      .filter(m => m.time)
      .filter(m => timeToMinutes(m.time) >= now)
      .sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time))

    const list: any[] = []

    missed.forEach(m => {
      list.push({
        id: `missed-${m.id}`,
        title: "Missed Medication",
        text: `${m.name} at ${m.time}`,
        icon: "alert",
        missed: true,
      })
    })

    if (upcoming[0]) {
      list.push({
        id: `next-${upcoming[0].id}`,
        title: "Next Medication",
        text: `${upcoming[0].name} at ${upcoming[0].time}`,
        icon: "clock",
        missed: false,
      })
    }

    setMissedMeds(missed)
    setNotifications(list)
  }, [medications])
  const [showAnalysisModal, setShowAnalysisModal] = useState(false)
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null)

  async function uploadAndAnalyzeFile(file: File) {
    if (!file) return

    setUploading(true)
    setUploadedFileName(file.name)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/documentation", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to analyze document")
      }

      const data = await response.json()
      setAnalysisResult(data.result)
      setShowUploadModal(false)
      setShowAnalysisModal(true)
    } catch (error: any) {
      console.error("Upload error:", error)
      alert(`Failed to analyze document: ${error.message}`)
      setShowUploadModal(false)
    } finally {
      setUploading(false)
    }
  }

  function handleFileDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    const files = e.dataTransfer.files
    console.log("Dropped files:", files)

    if (files.length > 0) {
      uploadAndAnalyzeFile(files[0])
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    console.log("Selected files:", files)

    if (files && files.length > 0) {
      uploadAndAnalyzeFile(files[0])
    }
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
                  profile?.photoThumbURL ||
                  profile?.photoURL ||
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
                      {firstName || "User"}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setShowProfileMenu(false)
                      router.push("/Profile")
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
                        router.push("/") // always redirect to landing
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
                      href="/Chat"
                      className="flex-1 aspect-square max-w-[255px]"
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
                      href="/medicine-centre"
                      className="flex-1 aspect-square max-w-[255px]"
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
                      className="flex-1 aspect-square max-w-[255px]"
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
                      className="relative overflow-hidden cursor-pointer group flex-1 aspect-square max-w-[255px] bg-white rounded-[2.5rem] p-8 flex flex-col items-center justify-center gap-4 shadow-sm hover:shadow-md transition-all border border-primary/5"
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
              <h2 className="text-3xl font-bold text-primary mb-4 tracking-tight">Health Overview</h2>
              <div className="flex-1 bg-white rounded-[3rem] p-8 shadow-sm border border-primary/5">
                <HealthChart />
              </div>
            </div>
          </section>
        </main>

        {/* Missed meds banner */}
        {missedMeds.length > 0 && (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[90] px-6 py-3 rounded-2xl bg-red-600 text-white shadow-lg">
            <p className="text-sm font-semibold">
              You have {missedMeds.length} missed medication
              {missedMeds.length > 1 ? "s" : ""}.
            </p>
          </div>
        )}
        {showUploadModal && (
          <div
            className="fixed inset-0 z-[100] bg-black/30 backdrop-blur-sm flex items-center justify-center px-4"
            onClick={() => !uploading && setShowUploadModal(false)}
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
                onClick={() => !uploading && setShowUploadModal(false)}
                disabled={uploading}
                className="absolute top-3 right-3 p-2 rounded-full hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Close upload"
              >
                <X className="w-4 h-4 text-primary" strokeWidth={2} />
              </button>

              <h3 className="text-lg font-bold text-primary mb-4">Upload Report</h3>

              {uploading ? (
                <div className="flex flex-col items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                  <p className="text-sm text-primary/80 text-center">
                    Analyzing document with AI...
                  </p>
                  {uploadedFileName && (
                    <p className="text-xs text-primary/60 mt-2">{uploadedFileName}</p>
                  )}
                </div>
              ) : (
                <div
                  className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-colors p-8 ${
                    dragActive ? "border-primary bg-primary/5" : "border-primary/20"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.gif,.webp,.txt,.doc,.docx"
                    className="hidden"
                    onChange={handleFileSelect}
                    disabled={uploading}
                  />

                  <FileText className="w-10 h-10 text-primary mb-3" strokeWidth={1.5} />

                  <p className="text-sm text-primary/80 text-center mb-2">
                    Drop your documents here
                  </p>
                  <p className="text-xs text-primary/60 mb-4">or</p>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="px-4 py-2 rounded-full bg-[#F0BF70] text-black font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Browse files
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
        {showAnalysisModal && analysisResult && (
          <div
            className="fixed inset-0 z-[100] bg-black/30 backdrop-blur-sm flex items-center justify-center px-4"
            onClick={() => setShowAnalysisModal(false)}
          >
            <div
              className="relative bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] p-6 shadow-xl border border-primary/10 flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowAnalysisModal(false)}
                className="absolute top-3 right-3 p-2 rounded-full hover:bg-primary/10"
                aria-label="Close analysis"
              >
                <X className="w-4 h-4 text-primary" strokeWidth={2} />
              </button>

              <h3 className="text-lg font-bold text-primary mb-4">
                Document Analysis
              </h3>
              {uploadedFileName && (
                <p className="text-xs text-primary/60 mb-4">File: {uploadedFileName}</p>
              )}

              {/* Hint for editing */}
              <p className="text-xs text-primary/60 mb-2">
                Click ✏️ to edit any incorrect AI-detected information
              </p>

              <div className="flex-1 overflow-y-auto pr-2">
                <div className="flex flex-col gap-4 text-sm text-primary/90">
                  {analysisResult
                    .split(/\n\s*\n/)
                    .map((block, index) => {
                      const lines = block.split("\n")
                      const nameLine = lines.find(l =>
                        l.toLowerCase().startsWith("medicine name")
                      )
                      const name = nameLine
                        ? nameLine.split(":").slice(1).join(":").trim()
                        : `Medicine ${index + 1}`
                      // Make details editable: use state for each block
                      // We'll use a local state for all blocks for simplicity
                      // But here, for each render, we need to keep the details as mutable array
                      // So we use a ref array to store the details for each card
                      // For now, keep details as a local variable (will mutate in input onChange)
                      const details = lines.filter(l => l !== nameLine)
                      return (
                        <div
                          key={index}
                          className="relative rounded-2xl border border-primary/10 bg-primary/5 p-4 shadow-sm"
                        >
                          {/* Edit button */}
                          <button
                            onClick={() =>
                              setEditingIndex(editingIndex === index ? null : index)
                            }
                            className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-primary/10"
                            aria-label="Edit medicine"
                          >
                            ✏️
                          </button>

                          {/* Medicine title */}
                          <h4 className="text-base font-bold text-primary mb-3">
                            {index + 1}. {name}
                          </h4>

                          {/* Editable / Read-only fields */}
                          <div className="space-y-2">
                            {details.map((d, i) => {
                              const [label, ...rest] = d.split(":")
                              const value = rest.join(":").trim()

                              return (
                                <div key={i} className="flex items-center gap-2">
                                  <span className="font-medium min-w-[130px]">
                                    {label.replace(/^Medicine\s+/i, "")}:
                                  </span>

                                  {editingIndex === index ? (
                                    <input
                                      defaultValue={value}
                                      className="flex-1 rounded-lg border border-primary/20 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                                      onChange={(e) => {
                                        details[i] = `${label}: ${e.target.value}`
                                      }}
                                    />
                                  ) : (
                                    <span className="text-sm">{value}</span>
                                  )}
                                </div>
                              )
                            })}
                            {editingIndex === index && (
                              <div className="mt-3 flex justify-end">
                                <button
                                  onClick={() => {
                                    const map: any = {}

                                    details.forEach(d => {
                                      const [label, ...rest] = d.split(":")
                                      const value = rest.join(":").trim()

                                      const key = label
                                        .toLowerCase()
                                        .replace("medicine", "")
                                        .trim()

                                      map[key] = value
                                    })

                                    saveMedicineToFirestore({
                                      name,
                                      dosage: map.dosage || "Not specified",
                                      frequency: map.frequency || "Not specified",
                                      duration: map.duration || "Not specified",
                                      instructions: map.instructions || "Not specified",
                                    })

                                    setEditingIndex(null)
                                  }}
                                  className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold hover:opacity-90"
                                >
                                  Save to Medications
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-primary/10 flex gap-3">
                <button
                  onClick={() => {
                    setShowAnalysisModal(false)
                    setAnalysisResult(null)
                    setUploadedFileName(null)
                  }}
                  className="flex-1 px-4 py-2 rounded-xl bg-primary text-white font-semibold hover:opacity-90"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    if (!analysisResult) return

                    // Parse and save all medicines at once
                    analysisResult
                      .split(/\n\s*\n/)
                      .forEach(block => {
                        const lines = block.split("\n")

                        const nameLine = lines.find(l =>
                          l.toLowerCase().startsWith("medicine name")
                        )

                        if (!nameLine) return

                        const name = nameLine.split(":").slice(1).join(":").trim()
                        const details = lines.filter(l => l !== nameLine)

                        const map: any = {}

                        details.forEach(d => {
                          const [label, ...rest] = d.split(":")
                          const value = rest.join(":").trim()

                          const key = label
                            .toLowerCase()
                            .replace("medicine", "")
                            .trim()

                          map[key] = value
                        })

                        saveMedicineToFirestore({
                          name,
                          dosage: map.dosage || "Not specified",
                          frequency: map.frequency || "Not specified",
                          duration: map.duration || "Not specified",
                          instructions: map.instructions || "Not specified",
                        })
                      })

                    setShowAnalysisModal(false)
                    setAnalysisResult(null)
                    setUploadedFileName(null)
                  }}
                  className="flex-1 px-4 py-2 rounded-xl bg-[#F0BF70] text-black font-semibold hover:opacity-90"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
