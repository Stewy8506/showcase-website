
"use client"
import Link from "next/link"

export default function TeamPage() {
  return (
    <main className="min-h-screen w-full flex justify-center px-4 py-12 bg-muted/40">
      <div className="w-full max-w-6xl rounded-2xl bg-white shadow-xl border border-border p-8 md:p-10">
        {/* Return Home Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          ← Return to home
        </Link>
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-10">
          <div>
            <p className="text-sm font-medium text-muted-foreground tracking-wide">04</p>
            <h1 className="text-2xl md:text-3xl font-semibold mt-1">Our team</h1>

            <p className="mt-3 max-w-2xl text-muted-foreground text-sm leading-relaxed">
              We craft solutions that amplify key characteristics, achieving a harmonious balance of
              function and intent. Through careful analysis and collaborative engagement, our spaces
              transcend the conventional.
            </p>
          </div>

          <button className="self-start mt-2 px-4 py-2 rounded-full border text-sm hover:bg-muted transition">
            Read more
          </button>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Member 1 */}
          <div className="rounded-xl border bg-muted/10">
            <div className="relative w-full aspect-[4/5] rounded-t-xl overflow-hidden bg-muted">
              <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                Add image
              </div>
            </div>

            <div className="px-4 py-3">
              <p className="font-medium text-sm">Michael Scott</p>
              <p className="text-xs text-muted-foreground mt-1">
                Co‑Founder, Chief Architect
              </p>
            </div>
          </div>

          {/* Member 2 */}
          <div className="rounded-xl border bg-muted/10">
            <div className="relative w-full aspect-[4/5] rounded-t-xl overflow-hidden bg-muted">
              <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                Add image
              </div>
            </div>

            <div className="px-4 py-3">
              <p className="font-medium text-sm">Chandler Rigs</p>
              <p className="text-xs text-muted-foreground mt-1">
                Co‑Founder, Architect
              </p>
            </div>
          </div>

          {/* Member 3 */}
          <div className="rounded-xl border bg-muted/10">
            <div className="relative w-full aspect-[4/5] rounded-t-xl overflow-hidden bg-muted">
              <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                Add image
              </div>
            </div>

            <div className="px-4 py-3">
              <p className="font-medium text-sm">Isabella Rodriguez</p>
              <p className="text-xs text-muted-foreground mt-1">
                Architect
              </p>
            </div>
          </div>

          {/* Member 4 */}
          <div className="rounded-xl border bg-muted/10">
            <div className="relative w-full aspect-[4/5] rounded-t-xl overflow-hidden bg-muted">
              <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                Add image
              </div>
            </div>

            <div className="px-4 py-3">
              <p className="font-medium text-sm">Ava Wilson</p>
              <p className="text-xs text-muted-foreground mt-1">
                3D Artist
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}