"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, Clock, AlertCircle, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface NotificationBellProps {
  notifications: any[];
  setNotifications: (fn: (prev: any[]) => any[]) => void;
  hasMissed: boolean;
}

export function NotificationsBell({
  notifications,
  setNotifications,
  hasMissed,
}: NotificationBellProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const notifRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        notifRef.current &&
        !notifRef.current.contains(e.target as Node)
      ) {
        setShowNotifications(false);
      }
    }

    if (showNotifications) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNotifications]);

  function removeNotification(id: string) {
    setRemovingId(id);
    setTimeout(() => {
      setNotifications((list) => list.filter((n) => n.id !== id));
      setRemovingId(null);
    }, 160);
  }

  function clearAll() {
    setNotifications(() => []);
  }

  return (
    <div className="relative" ref={notifRef}>
      <button
        onClick={() => setShowNotifications((v) => !v)}
        className="relative p-3 rounded-full hover:bg-muted active:bg-muted/70 transition-colors"
        aria-label="Open notifications"
      >
        <Bell className="w-7 h-7 text-primary" strokeWidth={1.4} />

        {/* Indicator dot */}
        {notifications.length > 0 && (
          <span
            className={`absolute top-0.5 right-0.5 rounded-full border-2 border-background ${
              hasMissed
                ? "w-3.5 h-3.5 bg-red-500"
                : "w-2 h-2 bg-secondary"
            }`}
          />
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {showNotifications && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 6 }}
            transition={{ duration: 0.16 }}
            className="absolute right-0 mt-3 bg-white rounded-3xl shadow-lg border border-primary/10 w-[360px] z-50 overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-primary/10 flex justify-between items-center">
              <p className="text-sm font-semibold text-primary">
                Notifications
              </p>

              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="text-xs text-primary/60 hover:text-primary font-semibold"
                >
                  Clear all
                </button>
              )}
            </div>

            <div className="max-h-[300px] overflow-y-auto p-3 flex flex-col gap-2">
              <AnimatePresence initial={false}>
                {notifications.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="px-3 py-6 text-center text-sm text-primary/60"
                  >
                    No notifications
                  </motion.div>
                )}

                {notifications.map((n) => (
                  <motion.div
                    key={n.id}
                    layout
                    initial={{ opacity: 0, y: 4, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.98 }}
                    transition={{ duration: 0.16 }}
                    className={`flex items-start gap-3 p-3 rounded-2xl transition-all duration-200 border ${
                      n.missed
                        ? "bg-red-50 border-red-500/60"
                        : "bg-primary/5 border-primary/5"
                    } ${
                      removingId === n.id
                        ? "opacity-0 scale-95 translate-y-1"
                        : "opacity-100"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center border">
                      {n.missed ? (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      ) : (
                        <Clock className="w-4 h-4 text-primary" />
                      )}
                    </div>

                    <div className="flex-1">
                      <p className="text-sm font-semibold text-primary">
                        {n.title}
                      </p>
                      <p className="text-xs text-primary/70">
                        {n.text}
                      </p>
                    </div>

                    <button
                      onClick={() => removeNotification(n.id)}
                      className="p-1 rounded-full hover:bg-primary/10"
                    >
                      <X className="w-3.5 h-3.5 text-primary" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}