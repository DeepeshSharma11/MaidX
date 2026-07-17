"use client";

import { useState } from "react";
import Card from "./Card";
import { Sliders, CheckCircle2 } from "lucide-react";

const SERVICES = [
  { id: "cleaning", label: "Cleaning 🧹", baseRate: 120 },
  { id: "cooking", label: "Cooking 🍳", baseRate: 150 },
  { id: "laundry", label: "Laundry 👕", baseRate: 100 },
  { id: "childcare", label: "Child Care 👶", baseRate: 180 },
  { id: "eldercare", label: "Elderly Care 👴", baseRate: 180 },
];

export default function PriceCalculator() {
  const [selectedService, setSelectedService] = useState("cleaning");
  const [hoursPerDay, setHoursPerDay] = useState(2);
  const [daysPerWeek, setDaysPerWeek] = useState(5);

  const activeService = SERVICES.find((s) => s.id === selectedService) || SERVICES[0];
  
  // Calculate pricing estimates
  const hourlyRate = activeService.baseRate;
  
  // Apply a bulk discount for more hours
  const discountFactor = hoursPerDay >= 6 ? 0.85 : hoursPerDay >= 4 ? 0.90 : 1.0;
  const finalHourlyRate = Math.round(hourlyRate * discountFactor);
  
  const dailyCost = finalHourlyRate * hoursPerDay;
  const weeklyCost = dailyCost * daysPerWeek;
  const monthlyCost = Math.round(weeklyCost * 4.33); // 4.33 weeks per month

  return (
    <Card className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 dark:bg-indigo-500/2 rounded-full blur-2xl pointer-events-none" />
      
      <div className="grid md:grid-cols-2 gap-8 items-center">
        {/* Left Column: Controls */}
        <div className="space-y-6">
          <div>
            <label className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block mb-3">
              1. Select Service Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {SERVICES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedService(s.id)}
                  className={`px-3 py-2 text-xs font-bold rounded-xl border text-center transition-all ${
                    selectedService === s.id
                      ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-500/20"
                      : "bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                2. Hours Per Day
              </label>
              <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                {hoursPerDay} {hoursPerDay === 1 ? "hour" : "hours"}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="8"
              value={hoursPerDay}
              onChange={(e) => setHoursPerDay(parseInt(e.target.value))}
              className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-[10px] text-zinc-400 mt-1">
              <span>1 hr</span>
              <span>4 hrs</span>
              <span>8 hrs (Full time)</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                3. Frequency (Days/Week)
              </label>
              <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                {daysPerWeek} {daysPerWeek === 1 ? "day" : "days"}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="7"
              value={daysPerWeek}
              onChange={(e) => setDaysPerWeek(parseInt(e.target.value))}
              className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-[10px] text-zinc-400 mt-1">
              <span>1 day</span>
              <span>5 days (Mon-Fri)</span>
              <span>7 days</span>
            </div>
          </div>
        </div>

        {/* Right Column: Pricing Display */}
        <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/50 dark:border-zinc-800/30 rounded-2xl p-6 flex flex-col justify-between h-full space-y-6">
          <div>
            <h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-4 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-600" /> Estimation Summary
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Base Rate</span>
                <span className="font-semibold text-zinc-950 dark:text-white">₹{hourlyRate}/hour</span>
              </div>
              {hoursPerDay >= 4 && (
                <div className="flex justify-between text-sm text-emerald-600 dark:text-emerald-400">
                  <span>Bulk Discount Applied</span>
                  <span>-{hoursPerDay >= 6 ? "15%" : "10%"}</span>
                </div>
              )}
              <div className="flex justify-between text-sm pt-2 border-t border-zinc-200/60 dark:border-zinc-800">
                <span className="text-zinc-500">Effective Rate</span>
                <span className="font-semibold text-zinc-950 dark:text-white">₹{finalHourlyRate}/hour</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-200/60 dark:border-zinc-800">
            <span className="text-xs text-zinc-400 block uppercase tracking-wider mb-1">Estimated Monthly Cost</span>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-indigo-600 dark:text-indigo-400">₹{monthlyCost.toLocaleString("en-IN")}</span>
              <span className="text-zinc-500 text-sm">/month</span>
            </div>
            <p className="text-[10px] text-zinc-400 mt-2">
              *Estimates are calculated based on avg. hourly bookings. Real rates are decided directly by helpers.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
