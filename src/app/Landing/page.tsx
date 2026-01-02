"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth"
import { auth } from "@/lib/firebase"

export default function LandingPage() {
  async function handleGoogleLogin() {
    try {
      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)

      window.location.href = "/Dashboard"
    } catch (err) {
      console.error("Google login failed", err)
    }
  }

  function handleGetStarted() {
    const user = auth.currentUser

    if (user) {
      // user already logged in → go to dashboard
      window.location.href = "/Dashboard"
    } else {
      // not logged in → go to signup
      window.location.href = "/signup"
    }
  }

  return (
    <main className="min-h-screen flex flex-col px-6 md:px-12 py-8 bg-background selection:bg-primary selection:text-primary-foreground">
      {/* Navigation Header */}
      <header className="flex items-start justify-between w-full max-w-7xl mx-auto mb-12 relative">
        <div className="flex-1 hidden md:block" /> {/* Spacer */}
        {/* Central Logo Area */}
        <div className="flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight">
            Your <span className="font-serif italic font-normal">Personal</span>
            <br />
            Health App
          </h1>
          <div className="mt-2 w-48 h-4 relative">
            {/* Hand-drawn squiggle effect */}
            <svg viewBox="0 0 200 20" className="w-full h-full text-primary fill-none stroke-current stroke-[3]">
              <path d="M5,10 Q25,5 45,10 T85,10 T125,10 T165,10 T195,10" />
              <path d="M10,15 Q30,10 50,15 T90,15 T130,15 T170,15 T190,15" className="opacity-70" />
            </svg>
          </div>
        </div>
        {/* Navigation Links */}
        <nav className="flex-1 flex justify-end items-center gap-4 text-muted-foreground font-medium pt-2">
          <Link href="/Landing" className="italic transition-colors">
            Home
          </Link>
          <span className="text-border">|</span>
          <Link href="/team" className="hover:text-foreground transition-colors">
            Team
          </Link>
          <span className="text-border">|</span>
          <Link href="/contact" className="hover:text-foreground transition-colors">
            Contact
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center max-w-7xl mx-auto w-full mb-16">
        {/* Left Content */}
        <div className="lg:col-span-5 flex flex-col gap-8 order-2 lg:order-1">
          <h2 className="text-3xl md:text-4xl font-semibold max-w-md">Be in control of your meds</h2>
          <div className="flex flex-col gap-6 text-lg md:text-xl text-foreground/80 leading-relaxed max-w-lg">
            <p className="font-serif italic">
              Lorem ipsum dolor sit amet consectetur. Enim ullamcorper at at sit urna. Viverra tincidunt sit proin
              interdum. Amet turpis libero varius vivamus augue potenti. Tellus augue a id feugiat risus.
            </p>
            <p className="text-base text-muted-foreground font-light">Smart Healthcare, for everyone.</p>
          </div>
        </div>

        {/* Right Illustration */}
        <div className="lg:col-span-7 flex justify-center lg:justify-end order-1 lg:order-2">
          <div className="relative w-full aspect-[4/3] max-w-[700px]">
            <Image
              src="/Landing Illustration.png"
              alt="Health App Dashboard Illustration"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
      </section>

      {/* Footer / CTA Section */}
      <footer className="w-full max-w-4xl mx-auto flex flex-col items-center gap-8 mb-8">
        <div className="flex items-center gap-4 w-full justify-center">
          {/* Google Sign-in Placeholder Circle */}
          <button
            onClick={handleGoogleLogin}
            className="bg-white rounded-full p-4 flex items-center justify-center w-16 h-16 shadow-lg hover:scale-105 transition"
            aria-label="Sign in with Google"
          >
            <svg viewBox="0 0 24 24" className="w-8 h-8">
              <path
                fill="#000000"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#000000"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#000000"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
              />
              <path
                fill="#000000"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          </button>

          <button
            onClick={handleGetStarted}
            className="group relative flex items-center justify-between bg-primary text-primary-foreground px-8 py-5 rounded-full text-2xl font-semibold transition-all hover:scale-[1.02] active:scale-95 flex-1 max-w-[400px]"
          >
            <span>Get Started</span>
            <ArrowUpRight className="w-8 h-8 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </button>
        </div>

        <p className="text-lg text-foreground/70">
          Already have an Account?{" "}
          <Link href="/login" className="text-foreground font-bold hover:underline underline-offset-4">
            Sign in
          </Link>
        </p>
      </footer>
    </main>
  )
}
