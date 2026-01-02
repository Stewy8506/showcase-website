"use client"
import Link from "next/link"
import { ArrowLeft, ArrowRight, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldContent, FieldLabel } from "@/components/ui/field"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { auth } from "@/lib/firebase"
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)

    try {
      await signInWithEmailAndPassword(auth, email, password)
      router.push("/Dashboard")
    } catch (err: any) {
      console.error("Firebase login error:", err)

      // Show friendly login error overlay
      const message =
        err?.code === "auth/invalid-credential" ||
        err?.code === "auth/wrong-password"
          ? "Incorrect email or password"
          : err?.message ?? "Failed to log in"

      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleGoogleSignIn = async () => {
    if (submitting) return
    setSubmitting(true)

    try {
      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)
      router.push("/Dashboard")
    } catch (err: any) {
      console.error("Firebase Google sign‑in error:", err)

      const message =
        err?.code === "auth/popup-closed-by-user"
          ? "Google sign‑in cancelled"
          : err?.message ?? "Failed to sign in with Google"

      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
      {/* Back to Home */}
      <Link
        href="/Landing"
        className="absolute top-8 left-8 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to home
      </Link>

      <div className="w-full max-w-[400px] flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Log In</h1>
          <p className="text-muted-foreground">Welcome back to Smart Meds.</p>
        </div>

        {/* Form */}
        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-4">
            <Field>
              <FieldLabel htmlFor="email">Email Address</FieldLabel>
              <FieldContent>
                <Input
                  id="email"
                  type="email"
                  placeholder="jane@example.com"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="rounded-xl h-12 border border-white/20"
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <FieldContent>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="rounded-xl h-12 border border-white/20"
                />
              </FieldContent>
            </Field>
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="w-full h-14 rounded-full text-lg font-semibold group"
          >
            Log In
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </form>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>

        {/* Google Button */}
        <Button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={submitting}
          variant="outline"
          className="w-full h-14 rounded-full text-lg bg-white/5 border-white/10 hover:bg-white/10"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 mr-2">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Google
        </Button>

        {/* Footer */}
        <p className="text-center text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-foreground font-bold hover:underline underline-offset-4">
            Create one
          </Link>
        </p>
      </div>

      {error && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <div className="px-4 py-2 rounded-xl bg-red-500/80 text-white border border-red-400 shadow-lg backdrop-blur-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span className="text-xs font-semibold">{error}</span>
            <button
              onClick={() => setError(null)}
              className="px-2 py-0.5 rounded-lg bg-white/10 hover:bg-white/20 text-[10px]"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </main>
  )
}