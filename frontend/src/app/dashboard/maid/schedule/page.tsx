"use client";

import { useEffect, useState } from "react";
import { useDeviceTier } from "@/hooks/useDeviceTier";
import { motion } from "framer-motion";
import { Calendar, Clock, CheckCircle2, Loader2, Info } from "lucide-react";
import api from "@/lib/api";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

interface Slot {
  day_of_week: number;
  start_time: string;
  end_time: string;
}

export default function MaidSchedulePage() {
  const tier = useDeviceTier();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const ItemWrapper = tier === "low" ? "div" : motion.div;
  const animProps = tier === "low" ? {} : { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3 } };

  useEffect(() => {
    async function fetch() {
      try {
        const { data } = await api.get("/profile/availability");
        setSlots(data.availability || []);
      } catch {
        // No availability yet — start fresh
        setSlots([]);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, []);

  const toggleDay = (day: number) => {
    if (slots.find(s => s.day_of_week === day)) {
      setSlots(slots.filter(s => s.day_of_week !== day));
    } else {
      setSlots([...slots, { day_of_week: day, start_time: "09:00", end_time: "18:00" }]);
    }
  };

  const updateSlot = (day: number, field: "start_time" | "end_time", value: string) => {
    setSlots(slots.map(s => s.day_of_week === day ? { ...s, [field]: value } : s));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post("/profile/availability", { availability: slots });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-emerald-500" /></div>;

  return (
    <div className="p-4 md:p-8 space-y-6 pb-24 md:pb-8 max-w-2xl mx-auto md:mx-0">
      <header>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">My Schedule</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Set the days and hours you're available for bookings.</p>
      </header>

      <ItemWrapper {...animProps} className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
        <p className="text-sm text-blue-700 dark:text-blue-300">
          Toggle days you're available and set your working hours. Clients will see your schedule when booking.
        </p>
      </ItemWrapper>

      <div className="space-y-3">
        {DAYS.map((day, idx) => {
          const slot = slots.find(s => s.day_of_week === idx);
          const isActive = !!slot;
          return (
            <ItemWrapper key={day} {...animProps} transition={tier !== "low" ? { delay: idx * 0.04 } : undefined}
              className={`bg-white dark:bg-zinc-900 border rounded-2xl p-4 transition-all ${
                isActive ? "border-emerald-300 dark:border-emerald-700" : "border-zinc-200 dark:border-zinc-800"
              }`}>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleDay(idx)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                      isActive ? "bg-emerald-600" : "bg-zinc-300 dark:bg-zinc-600"
                    }`}
                  >
                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${isActive ? "translate-x-5" : "translate-x-0"}`} />
                  </button>
                  <span className={`font-medium text-sm ${isActive ? "text-zinc-900 dark:text-white" : "text-zinc-400 dark:text-zinc-600"}`}>
                    {day}
                  </span>
                </div>

                {isActive && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-emerald-500 shrink-0" />
                    <input
                      type="time" value={slot.start_time}
                      onChange={e => updateSlot(idx, "start_time", e.target.value)}
                      className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-1 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <span className="text-zinc-400">–</span>
                    <input
                      type="time" value={slot.end_time}
                      onChange={e => updateSlot(idx, "end_time", e.target.value)}
                      className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-1 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                )}

                {!isActive && (
                  <span className="text-xs text-zinc-400">Unavailable</span>
                )}
              </div>
            </ItemWrapper>
          );
        })}
      </div>

      <div className="flex justify-end pt-2">
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50 w-full md:w-auto justify-center">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <><CheckCircle2 className="w-4 h-4" /> Saved!</> : <><Calendar className="w-4 h-4" /> Save Schedule</>}
        </button>
      </div>
    </div>
  );
}
