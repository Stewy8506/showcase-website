"use client";

import { useEffect, useState, useRef } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Pill } from "lucide-react";

/* ---------------- TYPES ---------------- */

type Medicine = {
  id: string;
  name?: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  instructions?: string;
  reminderTimes?: string[];
};

/* ---------------- DEFAULT REMINDER LOGIC ---------------- */

function getReminderTimes(frequency?: string): string[] {
  if (!frequency) return [];
  const f = frequency.toLowerCase();
  if (f.includes("once")) return ["09:00"];
  if (f.includes("twice")) return ["09:00", "21:00"];
  if (f.includes("thrice")) return ["09:00", "15:00", "21:00"];
  return [];
}

/* ---------------- PAGE ---------------- */

export default function MedicineCentrePage() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});

  // Prevent repeated alerts in same minute
  const lastAlertRef = useRef<string>("");

  /* -------- FETCH MEDICINES -------- */

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(false);
        return;
      }

      const ref = collection(db, "users", user.uid, "medical");
      const snap = await getDocs(ref);

      const meds = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setMedicines(meds);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  /* -------- IN-APP REMINDERS (ALERT) -------- */

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().toTimeString().slice(0, 5); // HH:MM

      medicines.forEach((med) => {
        if (med.reminderTimes?.includes(now)) {
          const key = `${med.id}-${now}`;

          if (lastAlertRef.current !== key) {
            alert(
              `💊 Time to take ${med.name}\nDosage: ${med.dosage}`
            );
            lastAlertRef.current = key;
          }
        }
      });
    }, 60_000);

    return () => clearInterval(interval);
  }, [medicines]);

  if (loading) return <p className="p-6">Loading medicines...</p>;

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen bg-background text-foreground dark">
      {/* ---------- HEADER ---------- */}
      <header className="border-b border-border bg-primary/20 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-6 flex items-center gap-3">
          <div className="p-2.5 bg-accent/20 rounded-lg">
            <Pill size={28} className="text-accent" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Medicine Centre</h1>
            <p className="text-muted-foreground text-sm">
              Manage your medications and reminders
            </p>
          </div>
        </div>
      </header>

      {/* ---------- MAIN ---------- */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {medicines.length === 0 ? (
          <p>No medicines found.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {medicines
              .filter((m) => m.dosage && m.dosage !== "Not specified")
              .map((med) => (
                <div
                  key={med.id}
                  className="border border-border rounded-lg p-4 bg-primary/10"
                >
                  {editingId === med.id ? (
                    <>
                      <input
                        className="w-full mb-2"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                      />
                      <input
                        className="w-full mb-2"
                        value={formData.dosage}
                        onChange={(e) =>
                          setFormData({ ...formData, dosage: e.target.value })
                        }
                      />
                      <input
                        className="w-full mb-2"
                        value={formData.frequency}
                        onChange={(e) =>
                          setFormData({ ...formData, frequency: e.target.value })
                        }
                      />
                      <input
                        className="w-full mb-2"
                        value={formData.duration}
                        onChange={(e) =>
                          setFormData({ ...formData, duration: e.target.value })
                        }
                      />
                      <textarea
                        className="w-full mb-2"
                        value={formData.instructions}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            instructions: e.target.value,
                          })
                        }
                      />

                      <div className="mb-2">
                        <strong>Reminder Times</strong>
                        {(formData.reminderTimes || []).map(
                          (t: string, i: number) => (
                            <input
                              key={i}
                              type="time"
                              className="block"
                              value={t}
                              onChange={(e) => {
                                const arr = [...formData.reminderTimes];
                                arr[i] = e.target.value;
                                setFormData({
                                  ...formData,
                                  reminderTimes: arr,
                                });
                              }}
                            />
                          )
                        )}
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              reminderTimes: [
                                ...(formData.reminderTimes || []),
                                "09:00",
                              ],
                            })
                          }
                        >
                          + Add Reminder
                        </Button>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={async () => {
                            const user = getAuth().currentUser;
                            if (!user) return;

                            await updateDoc(
                              doc(db, "users", user.uid, "medical", med.id),
                              {
                                ...formData,
                                reminderTimes:
                                  formData.reminderTimes || [],
                              }
                            );

                            setMedicines((prev) =>
                              prev.map((m) =>
                                m.id === med.id
                                  ? { ...m, ...formData }
                                  : m
                              )
                            );
                            setEditingId(null);
                          }}
                        >
                          Save
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setEditingId(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <h3 className="text-lg font-semibold">{med.name}</h3>
                      <p>Dosage: {med.dosage}</p>
                      <p>Frequency: {med.frequency}</p>
                      <p>Duration: {med.duration}</p>
                      <p>Instructions: {med.instructions}</p>
                      {med.reminderTimes && (
                        <p>
                          Reminders: {med.reminderTimes.join(", ")}
                        </p>
                      )}
                      <Button
                        size="sm"
                        onClick={() => {
                          setEditingId(med.id);
                          setFormData({
                            name: med.name || "",
                            dosage: med.dosage || "",
                            frequency: med.frequency || "",
                            duration: med.duration || "",
                            instructions: med.instructions || "",
                            reminderTimes:
                              med.reminderTimes?.length
                                ? med.reminderTimes
                                : getReminderTimes(med.frequency),
                          });
                        }}
                      >
                        Edit
                      </Button>
                    </>
                  )}
                </div>
              ))}
          </div>
        )}
      </main>
    </div>
  );
}
