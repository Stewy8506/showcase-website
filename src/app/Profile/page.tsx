"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { auth } from "@/lib/firebase"
import { onAuthStateChanged, signOut, type User } from "firebase/auth"
import { doc, onSnapshot, updateDoc, getDoc, setDoc } from "firebase/firestore"
import { migrateAuthUserToProfile } from "@/lib/firestore/users"
import { db } from "@/lib/firebase"
import Link from "next/link"
import { ArrowLeft, LogOut, PenLine } from "lucide-react"

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const [showEditModal, setShowEditModal] = useState(false)
  const [hasAutoOpenedEdit, setHasAutoOpenedEdit] = useState(false)
  const [editFullName, setEditFullName] = useState("")
  const [editDob, setEditDob] = useState("")
  const [editGender, setEditGender] = useState("")
  const [editPhone, setEditPhone] = useState("")
  const [editPhotoURL, setEditPhotoURL] = useState("")
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [editPhotoThumbURL, setEditPhotoThumbURL] = useState("")
  const [localPhotoPreview, setLocalPhotoPreview] = useState<string | null>(null)

  useEffect(() => {
    let profileUnsub: (() => void) | null = null

    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) {
        router.push("/Landing")
        return
      }
      setUser(u)

      // Ensure profile exists before listening (prevents permission-denied)
      try {
        const ref = doc(db, "users", u.uid)

        getDoc(ref)
          .then(async (snap) => {
            if (!snap.exists()) {
              try {
                // create profile for first-time / legacy users
                await migrateAuthUserToProfile(u)
              } catch (err) {
                console.error("Failed to create Firestore profile:", err)
              }
            }

            // Realtime listener AFTER profile is guaranteed to exist
            profileUnsub = onSnapshot(
              ref,
              (snap) => {
                if (snap.exists()) {
                  const data = snap.data()
                  setProfile(data)

                  // populate form fields for editing
                  setEditFullName(data.fullName ?? data.firstName ?? "")
                  setEditDob(data.dob ?? "")
                  setEditGender(data.gender ?? "")
                  setEditPhone(data.phoneNumber ?? "")
                  setEditPhotoURL(data.photoURL ?? "")
                  setEditPhotoThumbURL(data.photoThumbURL ?? "")

                  // Auto‑open edit modal on first visit if profile is incomplete
                  // (DOB is optional)
                  const isIncomplete =
                    !data.fullName ||
                    !data.gender ||
                    !data.phoneNumber

                  if (isIncomplete && !hasAutoOpenedEdit) {
                    setShowEditModal(true)
                    setHasAutoOpenedEdit(true)
                  }
                } else {
                  setProfile(null)

                  // ensure inputs remain controlled
                  setEditFullName("")
                  setEditDob("")
                  setEditGender("")
                  setEditPhone("")
                  setEditPhotoURL("")
                  setEditPhotoThumbURL("")
                }

                setLoading(false)
              },
              (err) => {
                console.error("Realtime profile listener failed:", err)
                setLoading(false)
              }
            )
          })
          .catch((err) => {
            console.error("Error checking user profile:", err)
            setLoading(false)
          })
      } catch (err) {
        console.error("Failed to start profile listener:", err)
        setLoading(false)
      }
    })
    return () => {
      if (profileUnsub) profileUnsub()
      unsub()
    }
  }, [router])

  const handleLogout = async () => {
    await signOut(auth)
    router.push("/Landing")
  }

  const handlePhotoUpload = async (file: File) => {
    if (!user) return
    try {
      setUploadingPhoto(true)

      // Local preview while uploading
      const previewUrl = URL.createObjectURL(file)
      setLocalPhotoPreview(previewUrl)

      const formData = new FormData()
      formData.append("file", file)
      formData.append("upload_preset", "profile-photos")

      // Cloudinary unsigned upload
      const res = await fetch(
        "https://api.cloudinary.com/v1_1/dq7j3qkcg/image/upload",
        {
          method: "POST",
          body: formData,
        }
      )

      if (!res.ok) {
        console.error("Cloudinary upload failed", await res.text())
        throw new Error("Upload failed")
      }

      const data = await res.json()
      const url = data.secure_url as string

      // Cloudinary secure original URL
      // Create optimized main image (auto format + compression + max width)
      const optimizedUrl = url.replace(
        "/upload/",
        "/upload/f_auto,q_auto:eco,w_1600/"
      )

      // Create circular thumbnail (256px, round mask)
      const thumbUrl = url.replace(
        "/upload/",
        "/upload/c_thumb,r_max,w_256,h_256,f_auto,q_auto/"
      )

      // Save both into edit state (persisted on Save)
      setEditPhotoURL(optimizedUrl)
      setEditPhotoThumbURL(thumbUrl)

      setUploadingPhoto(false)
    } catch (err) {
      console.error("Profile photo upload failed:", err)
      setUploadingPhoto(false)
    }
  }

  const handleSaveProfile = async () => {
    if (!user || uploadingPhoto) return

    const ref = doc(db, "users", user.uid)

    // Auto‑copy Google photo into Firestore on first save (if no uploaded photo yet)
    const googlePhoto = user.photoURL || null

    const finalPhotoURL =
      editPhotoURL ||
      profile?.photoURL ||
      googlePhoto ||
      null

    const finalThumbURL =
      editPhotoThumbURL ||
      profile?.photoThumbURL ||
      googlePhoto ||
      null

    // Normalize DOB — save entered value, otherwise preserve existing
    const finalDob =
      (editDob && editDob.trim() !== "" ? editDob : profile?.dob) || null

    await setDoc(
      ref,
      {
        fullName: editFullName || null,
        dob: finalDob,
        gender: editGender || null,
        phoneNumber: editPhone || null,
        photoURL: finalPhotoURL,
        photoThumbURL: finalThumbURL,
        updatedAt: new Date()
      },
      { merge: true }
    )

    setShowEditModal(false)
  }

  // Derive first name + age (if provided elsewhere in user data)
  const firstName =
    profile?.fullName?.split(" ")[0] ??
    profile?.firstName ??
    user?.displayName?.split(" ")[0] ??
    "Unnamed User"

  // Derive age from DOB if available
  // Expected formats: ISO date "YYYY-MM-DD" or Date-compatible string
  const dob =
    profile?.dob ||
    profile?.dateOfBirth ||
    (user as any)?.dob ||
    (user as any)?.dateOfBirth ||
    null

  let age: number | null = null

  if (dob) {
    const dobDate = new Date(dob)

    if (!isNaN(dobDate.getTime())) {
      const today = new Date()
      age = today.getFullYear() - dobDate.getFullYear()

      const monthDiff = today.getMonth() - dobDate.getMonth()
      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < dobDate.getDate())
      ) {
        age--
      }
    }
  }

  // Require profile completion for first‑time / incomplete profiles
  // (DOB is optional)
  const requireCompletion =
    !profile?.gender ||
    !profile?.phoneNumber

  return (
    <main className="dashboard-theme min-h-screen w-full flex justify-center px-4 py-8 bg-background/90">
        <Link
            href="/Dashboard"
            className="absolute top-8 left-8 flex items-center gap-2 text-[#0f172a] hover:text-primary/40  transition-colors group"
        >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
        </Link>
      <div className="w-full max-w-3xl rounded-[2.5rem] bg-white shadow-xl border border-primary/10 p-8 md:p-10 flex flex-col gap-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold text-primary tracking-tight">
            Profile
          </h1>
          <button
              onClick={handleLogout}
              className="px-4 py-2.5 rounded-xl bg-[#F0BF70] text-black font-semibold hover:opacity-90 transition flex items-center gap-2 cursor-pointer"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">Logout</span>
            </button>
        </div>

        

        {/* Loading State */}
        {loading && (
          <div className="w-full flex items-center justify-center py-16">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        )}

        {!loading && user && (
          <div className="flex flex-col gap-8">
            {/* User Card */}
            <div className="rounded-[2rem] border border-white bg-white p-6 flex flex-col md:flex-row gap-6 md:items-center">
              <div className="w-40 h-40 rounded-full bg-white border border-primary/20 shadow-sm overflow-hidden flex items-center justify-center text-primary font-bold text-2xl">
                {profile?.photoURL || editPhotoURL || user?.photoURL ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={
                      localPhotoPreview ||
                      profile?.photoThumbURL ||
                      editPhotoThumbURL ||
                      profile?.photoURL ||
                      editPhotoURL ||
                      user?.photoURL
                    }
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  (user.displayName?.[0] ?? "U")
                )}
              </div>

              <div className="flex-1 flex flex-col gap-1">
                <p className="text-lg font-semibold text-primary">
                  {age ? `${firstName}, ${age}` : firstName}
                </p>
                <p className="text-sm text-primary/70">
                  {profile?.email ?? user?.email ?? "No email available"}
                </p>
                <p className="text-sm text-primary/70">User ID:</p>
                <p className="text-xs text-primary/60 break-all">
                    {user.uid}
                </p>

                <p className="text-sm text-primary/70">Provider:</p>
                <p className="text-xs text-primary/60">
                 {user.providerData?.[0]?.providerId ?? "password"}
                </p>
              </div>
              <div className="md:ml-auto flex items-center">
                <button
                  onClick={() => setShowEditModal(true)}
                  className="px-4 py-2.5 rounded-xl border border-primary/0 bg-white items-center gap-2 cursor-pointer"
                  aria-label="Edit profile"
                >
                  <PenLine className="w-8 h-8 text-primary hover:text-primary/40" />
                </button>
              </div>
            </div>

            {/* Details Section */}
            <div className="rounded-[2rem] border border-primary/10 bg-white p-6 flex flex-col gap-4">
              <h2 className="text-lg font-bold text-primary">
                Medical Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-primary/10 bg-primary/5 p-4">
                  <p className="text-xs text-primary/60 mb-1">Name</p>
                  <p className="text-sm font-semibold text-primary">
                    {profile?.fullName ?? profile?.firstName ?? user?.displayName ?? "Not set"}
                  </p>
                </div>

                <div className="rounded-xl border border-primary/10 bg-primary/5 p-4">
                  <p className="text-xs text-primary/60 mb-1">Email</p>
                  <p className="text-sm font-semibold text-primary">
                    {profile?.email ?? user?.email ?? "Not set"}
                  </p>
                </div>

              </div>
            </div>
          </div>
        )}

        {showEditModal && (
          <div
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center px-4"
            onClick={() => {
              if (!requireCompletion && !uploadingPhoto) {
                setShowEditModal(false)
              }
            }}
          >
            <div
              className="bg-white rounded-[2rem] shadow-xl border border-primary/10 w-full max-w-2xl p-8 flex flex-col gap-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold text-primary">
                Edit Profile
              </h2>

              <div className="flex flex-col gap-4">

                <div className="flex flex-col gap-1">
                  <label className="text-sm text-primary/70">Profile Picture</label>

                  <div className="flex items-center gap-6 mt-2">

                    {/* Profile Thumbnail */}
                    {(localPhotoPreview || profile?.photoURL || editPhotoURL || user?.photoURL) && (
                      <div className="w-40 h-40 rounded-full border border-primary/20 overflow-hidden relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={
                            localPhotoPreview ||
                            profile?.photoThumbURL ||
                            editPhotoThumbURL ||
                            profile?.photoURL ||
                            editPhotoURL ||
                            user?.photoURL
                          }
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        {uploadingPhoto && (
                          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                            <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Drop‑zone Upload Button */}
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-primary/30 rounded-2xl px-6 py-6 cursor-pointer hover:border-primary/60 transition">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handlePhotoUpload(file)
                        }}
                      />

                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-8 h-8 text-primary mb-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>

                      <p className="text-sm text-primary font-medium">
                        Drop your documents here
                      </p>d

                      <p className="text-xs text-primary/60 mt-1">or</p>

                      <div className="mt-2 px-4 py-2 rounded-full bg-[#F0BF70] text-black font-semibold">
                        Browse files
                      </div>
                    </label>

                  </div>

                  {(profile?.photoURL || editPhotoURL || localPhotoPreview) && (
                    <button
                      onClick={() => {
                        setLocalPhotoPreview(null)
                        setEditPhotoURL("")
                        setEditPhotoThumbURL("")
                      }}
                      className="mt-2 text-xs px-3 py-1.5 rounded-lg border border-primary/20 text-primary hover:bg-primary/5 transition"
                      type="button"
                    >
                      Remove profile photo
                    </button>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm text-primary/70">Full Name</label>
                  <input
                    value={editFullName}
                    onChange={(e) => setEditFullName(e.target.value)}
                    className="w-full rounded-xl border border-primary/20 px-3 py-2 outline-none text-primary placeholder:text-primary/70"
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm text-primary/70">Date of Birth</label>
                  <input
                    type="date"
                    value={editDob || ""}
                    onChange={(e) => setEditDob(e.target.value)}
                    className="w-full rounded-xl border border-primary/20 px-3 py-2 outline-none text-primary placeholder:text-primary/70"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm text-primary/70">Gender</label>
                  <select
                    value={editGender}
                    onChange={(e) => setEditGender(e.target.value)}
                    className="w-full rounded-xl border border-primary/20 px-3 py-2 outline-none bg-white text-primary"
                  >
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer_not">Prefer not to say</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm text-primary/70">Phone Number</label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full rounded-xl border border-primary/20 px-3 py-2 outline-none text-primary placeholder:text-primary/70"
                    placeholder="+91 98765 43210"
                  />
                </div>

              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => {
                    if (!requireCompletion && !uploadingPhoto) {
                      setShowEditModal(false)
                    }
                  }}
                  disabled={uploadingPhoto || requireCompletion}
                  className="text-primary px-4 py-2 rounded-xl border border-primary/20 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                
                <button
                  onClick={() => {
                    if (!uploadingPhoto && editGender && editPhone) {
                      handleSaveProfile()
                    }
                  }}
                  disabled={
                    uploadingPhoto ||
                    !editGender ||
                    !editPhone
                  }
                  className="px-5 py-2.5 rounded-xl bg-[#F0BF70] text-black font-semibold hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
