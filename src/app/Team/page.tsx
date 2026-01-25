"use client"
import Link from "next/link"
import { motion } from "framer-motion"

export default function TeamPage() {
  return (
    <main className="dashboard-theme min-h-screen w-full flex justify-center px-4 py-12 bg-muted/40">
      <motion.div
        className="w-full max-w-6xl rounded-2xl bg-white shadow-xl border border-border p-8 md:p-10"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      >
        {/* Return Home Button */}
        <Link
          href="/Landing"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          ← Return to home
        </Link>
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-10">
          <div>
            <p className="text-sm font-medium text-muted-foreground tracking-wide">04</p>
            <h1 className="text-primary text-2xl md:text-3xl font-semibold mt-1">Our team</h1>

            <p className="mt-3 max-w-2xl text-foreground/50 text-sm leading-relaxed">
              We craft solutions that amplify key characteristics, achieving a harmonious balance of
              function and intent. Through careful analysis and collaborative engagement, our spaces
              transcend the conventional.
            </p>
          </div>

          <Link
            href="https://www.youtube.com/watch?v=paq6sVkkEg0"
            target="_blank"
            rel="noopener noreferrer"
            className="self-start mt-2 px-4 py-2 rounded-full border text-primary text-sm hover:bg-muted transition inline-block"
          >
            Don't Read More.
          </Link>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Member 1 */}
          <div className="rounded-xl border bg-muted/10">
            <div className="relative w-full aspect-[4/5] rounded-t-xl overflow-hidden bg-muted">
              <img
                src="/Anuvab.jpeg"
                alt="Anuvab"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="px-4 py-3">
              <p className="text-primary font-medium text-sm">Anuvab Das</p>
              <p className="text-xs text-foreground/50 mt-1">
                Chief Ejaculation Officer (CEO)
              </p>
            </div>
          </div>

          {/* Member 2 */}
          <div className="rounded-xl border bg-muted/10">
            <div className="relative w-full aspect-[4/5] rounded-t-xl overflow-hidden bg-muted">
              <img
                src="/Debadree.jpg"
                alt="Debadree"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="px-4 py-3">
              <p className="text-primary font-medium text-sm">Debadree Sekhar Das</p>
              <p className="text-xs text-foreground/50 mt-1">
                Chief API Sufferer
              </p>
            </div>
          </div>

          {/* Member 3 */}
          <div className="rounded-xl border bg-muted/10">
            <div className="relative w-full aspect-[4/5] rounded-t-xl overflow-hidden bg-muted">
              <img
                src="/Suchetan.jpeg"
                alt="Suchetan"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="px-4 py-3">
              <p className="text-primary font-medium text-sm">Suchetan Chakraborty</p>
              <p className="text-xs text-foreground/50 mt-1">
                Head Giver Finalboss
              </p>
            </div>
          </div>

          {/* Member 4 */}
          <div className="rounded-xl border bg-muted/10">
            <div className="relative w-full aspect-[4/5] rounded-t-xl overflow-hidden bg-muted">
              <img
                src="/Sagoto.webp"
                alt="Swagata"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="px-4 py-3">
              <p className="text-primary font-medium text-sm">Shagota Ganguly</p>
              <p className="text-xs text-foreground/50 mt-1">
                Professional Brokie
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </main>
  )
}