"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { MapPin, Save, CheckCircle2, Loader2 } from "lucide-react";
import api from "@/lib/api";

const LocationPicker = dynamic(() => import("@/components/LocationPicker"), { ssr: false });

export default function MaidLocationPage() {
  const [location, setLocation] = useState<{ lat: number; lng: number; address?: string } | undefined>();
  const [serviceRadius, setServiceRadius] = useState(5);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!location) {
      setError("Please select your location on the map.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await api.patch("/profile/location", {
        lat: location.lat,
        lng: location.lng,
        address: location.address,
        service_radius_km: serviceRadius,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail ?? "Failed to save location.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pb-20">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-4 py-4">
        <h1 className="text-lg font-bold text-zinc-900 dark:text-white">My Service Area</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
          Set where you offer your services so clients can find you.
        </p>
      </div>

      <div className="px-4 py-4 space-y-4 max-w-2xl mx-auto">
        {/* Map */}
        <div>
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-indigo-500" />
            Tap to set your location or drag the pin
          </p>
          <LocationPicker value={location} onChange={setLocation} height="300px" zoom={14} />
        </div>

        {/* Selected address */}
        {location?.address && (
          <div className="bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 rounded-xl px-4 py-3">
            <p className="text-xs font-medium text-indigo-700 dark:text-indigo-300">Selected location:</p>
            <p className="text-sm text-indigo-900 dark:text-indigo-200 mt-0.5 line-clamp-2">{location.address}</p>
          </div>
        )}

        {/* Service Radius */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Service radius</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">You'll be visible to clients within this range</p>
            </div>
            <span className="text-lg font-bold text-indigo-600">{serviceRadius} km</span>
          </div>
          <input
            type="range"
            min={1}
            max={30}
            value={serviceRadius}
            onChange={e => setServiceRadius(Number(e.target.value))}
            className="w-full accent-indigo-600"
          />
          <div className="flex justify-between text-xs text-zinc-400 mt-1">
            <span>1 km</span>
            <span>30 km</span>
          </div>
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-xl px-4 py-3">{error}</p>
        )}

        {/* Save button — fixed bottom on mobile */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 z-10">
          <button
            onClick={handleSave}
            disabled={loading || !location}
            className="w-full max-w-2xl mx-auto flex items-center justify-center gap-2 bg-indigo-600 disabled:bg-zinc-300 dark:disabled:bg-zinc-700 text-white rounded-2xl py-4 font-semibold text-base transition-colors"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : saved ? (
              <>
                <CheckCircle2 className="w-5 h-5" />
                Saved!
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Location
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
