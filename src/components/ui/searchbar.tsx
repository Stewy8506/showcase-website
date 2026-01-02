"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";

export function SearchBar() {
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  return (
    <>
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

      {/* Mobile overlay search */}
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
    </>
  );
}
