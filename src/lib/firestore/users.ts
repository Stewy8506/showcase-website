import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
  type Unsubscribe,
} from "firebase/firestore"
import { db } from "@/lib/firebase"

/**
 * Ensures that a Firestore profile document exists for the user.
 * Creates it on first sign‑in, otherwise updates lastLogin.
 */
export async function ensureUserProfile(user: any) {
  const ref = doc(db, "users", user.uid)
  const snap = await getDoc(ref)

  if (!snap.exists()) {
    const provider = user?.providerData?.[0]

    await setDoc(ref, {
      // names
      firstName: user.displayName?.split(" ")[0] ?? null,
      fullName: user.displayName ?? null,

      // contact + identity
      email: user.email ?? null,
      phoneNumber: user.phoneNumber ?? null,
      photoURL: user.photoURL ?? null,
      providerId: provider?.providerId ?? "password",

      // profile data
      dob: null, // filled later when user adds DOB
      gender: null, // set later when user provides gender

      // lifecycle timestamps
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
    })
  } else {
    // existing user — only update lastLogin
    await setDoc(
      ref,
      {
        lastLogin: serverTimestamp(),
      },
      { merge: true }
    )
  }

  return ref
}

/**
 * Fetches the user profile document once.
 */
export async function getUserProfile(uid: string) {
  const ref = doc(db, "users", uid)
  const snap = await getDoc(ref)
  return snap.exists() ? snap.data() : null
}

/**
 * Updates one or more profile fields.
 */
export async function updateUserProfile(
  uid: string,
  data: Record<string, any>
) {
  const ref = doc(db, "users", uid)
  await updateDoc(ref, {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

/**
 * Subscribes to realtime profile updates.
 * Returns an unsubscribe function.
 */
export function listenToUserProfile(
  uid: string,
  onData: (data: any | null) => void,
  onError?: (err: any) => void
): Unsubscribe {
  const ref = doc(db, "users", uid)

  return onSnapshot(
    ref,
    (snap) => {
      onData(snap.exists() ? snap.data() : null)
    },
    (err) => {
      onError?.(err)
    }
  )
}

/**
 * Back‑fills / migrates an existing Auth user into Firestore.
 * Safe to run multiple times — merges data without overwriting DOB.
 */
export async function migrateAuthUserToProfile(user: any) {
  const ref = await ensureUserProfile(user)
  const provider = user?.providerData?.[0]

  await updateDoc(ref, {
    // names
    firstName: user.displayName?.split(" ")[0] ?? null,
    fullName: user.displayName ?? null,

    // contact + identity
    email: user.email ?? null,
    phoneNumber: user.phoneNumber ?? null,
    photoURL: user.photoURL ?? null,
    providerId: provider?.providerId ?? "password",

    // lifecycle
    updatedAt: serverTimestamp(),
  })
}