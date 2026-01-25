"use client";

import { useEffect, useState, useRef } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  addDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Pill, Edit } from "lucide-react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

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

  const [showAddModal, setShowAddModal] = useState(false);
  const [newMed, setNewMed] = useState<any>({
    name: "",
    dosage: "",
    frequency: "",
    duration: "",
    instructions: "",
    reminderTimes: [],
  });

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
    <div className="dashboard-theme min-h-screen bg-background text-foreground dark">
      
      {/* ---------- HEADER ---------- */}
      <header className="border-w border-border bg-primary/0 backdrop-blur-sm sticky top-0 z-10">
      <Link
        href="/Dashboard"
        className="absolute top-8 left-8 flex items-center gap-2
        px-3 py-2 rounded-md
        bg-background/70 backdrop-blur
        text-foreground hover:text-primary transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Dashboard
      </Link>
        <div className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-accent/20 rounded-lg">
              <Pill size={28} className="text-accent" />
            </div>
            <div>
              <h1 className="text-primary text-3xl font-bold">Medicine Centre</h1>
              <p className="text-muted-foreground text-sm">
                Manage your medications and reminders
              </p>
            </div>
          </div>
          <Button onClick={() => setShowAddModal(true)}>
            + Add Medicine
          </Button>
        </div>
      </header>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background border border-border rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Add Medicine</h2>

            <input
              className="w-full mb-2"
              placeholder="Medicine name"
              value={newMed.name}
              onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
            />
            <input
              className="w-full mb-2"
              placeholder="Dosage"
              value={newMed.dosage}
              onChange={(e) => setNewMed({ ...newMed, dosage: e.target.value })}
            />
            <input
              className="w-full mb-2"
              placeholder="Frequency (e.g. Twice a day)"
              value={newMed.frequency}
              onChange={(e) => setNewMed({ ...newMed, frequency: e.target.value })}
            />
            <input
              className="w-full mb-2"
              placeholder="Duration"
              value={newMed.duration}
              onChange={(e) => setNewMed({ ...newMed, duration: e.target.value })}
            />
            <textarea
              className="w-full mb-2"
              placeholder="Instructions"
              value={newMed.instructions}
              onChange={(e) =>
                setNewMed({ ...newMed, instructions: e.target.value })
              }
            />

            <div className="flex gap-2 justify-end mt-4">
              <Button
                variant="outline"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  const user = getAuth().currentUser;
                  if (!user) return;

                  const data = {
                    ...newMed,
                    reminderTimes:
                      newMed.reminderTimes?.length
                        ? newMed.reminderTimes
                        : getReminderTimes(newMed.frequency),
                  };

                  const ref = await addDoc(
                    collection(db, "users", user.uid, "medical"),
                    data
                  );

                  setMedicines((prev) => [
                    ...prev,
                    { id: ref.id, ...data },
                  ]);

                  setNewMed({
                    name: "",
                    dosage: "",
                    frequency: "",
                    duration: "",
                    instructions: "",
                    reminderTimes: [],
                  });
                  setShowAddModal(false);
                }}
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ---------- MAIN ---------- */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        
        {medicines.length === 0 ? (
          <p>No medicines found.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {medicines
              .map((med) => (
                <div
                  key={med.id}
                  className="border border-border rounded-lg p-4 bg-primary/2"
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
                      <div className="flex items-center justify-between gap-2">
                        <div>
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
                        </div>

                        <Button
                          size="icon"
                          variant="ghost"
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
                          aria-label="Edit medicine"
                        >
                          <Edit size={18} />
                        </Button>
                      </div>
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
