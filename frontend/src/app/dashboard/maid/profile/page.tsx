"use client";

import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { useAuth } from "@/context/AuthContext";
import { useDeviceTier } from "@/hooks/useDeviceTier";
import { motion } from "framer-motion";
import {
  Save, Loader2, User as UserIcon, Tag, IndianRupee, LogOut,
  MapPin, Navigation, CheckCircle2, AlertCircle
} from "lucide-react";
import api from "@/lib/api";

const LocationPicker = dynamic(() => import("@/components/LocationPicker"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[200px] bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center">
      <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
    </div>
  ),
});

const ALL_SKILLS = ["Cleaning", "Cooking", "Laundry", "Baby Care", "Elderly Care", "Pet Care"];

interface LocationState {
  lat: number | null;
  lng: number | null;
  address: string;
  service_radius_km: number;
}

export default function MaidProfilePage() {
  const tier = useDeviceTier();
  const { logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [locSaving, setLocSaving] = useState(false);
  const [locSaved, setLocSaved] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState("");

  const [profile, setProfile] = useState({
    full_name: "", email: "", phone: "",
    hourly_rate: 0, skills: [] as string[],
    address: "", city: "", bio: "",
    notifications_enabled: true,
  });

  const [location, setLocation] = useState<LocationState>({
    lat: null, lng: null, address: "", service_radius_km: 5,
  });

  useEffect(() => {
    async function fetchProfile() {
      try {
        const { data } = await api.get("/profile");
        setProfile({
          full_name: data.full_name || "",
          email: data.email || "",
          phone: data.phone || "",
          hourly_rate: data.hourly_rate || 0,
          skills: data.skills || [],
          address: data.address || "",
          city: data.city || "",
          bio: data.bio || "",
          notifications_enabled: data.notifications_enabled ?? true,
        });
        // Load saved location coords
        if (data.lat && data.lng) {
          setLocation({
            lat: parseFloat(data.lat),
            lng: parseFloat(data.lng),
            address: data.address || "",
            service_radius_km: data.service_radius_km || 5,
          });
        }
      } catch (err) {
        console.error("Failed to fetch profile", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  // Reverse geocode using Nominatim (free, no API key)
  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        { headers: { "User-Agent": "MaidX/1.0" } }
      );
      const data = await res.json();
      const addr = data.address || {};
      const parts = [
        addr.road || addr.suburb,
        addr.city || addr.town || addr.village || addr.county,
        addr.state,
      ].filter(Boolean);
      return parts.join(", ");
    } catch {
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  };

  // GPS auto-detect
  const detectGPS = useCallback(() => {
    if (!navigator.geolocation) {
      setGpsError("GPS not supported on this device.");
      return;
    }
    setGpsLoading(true);
    setGpsError("");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const address = await reverseGeocode(lat, lng);
        setLocation(prev => ({ ...prev, lat, lng, address }));
        // Also auto-fill city in profile
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
            { headers: { "User-Agent": "MaidX/1.0" } }
          );
          const data = await res.json();
          const city = data.address?.city || data.address?.town || data.address?.village || "";
          if (city) setProfile(prev => ({ ...prev, city, address }));
        } catch {}
        setGpsLoading(false);
      },
      (err) => {
        setGpsLoading(false);
        if (err.code === 1) setGpsError("Location permission denied. Please allow location access.");
        else if (err.code === 2) setGpsError("Unable to detect location. Try again.");
        else setGpsError("Location request timed out.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  // Handle map pin drag/click
  const handleMapLocation = useCallback(async (val: { lat: number; lng: number; address?: string }) => {
    const address = val.address || await reverseGeocode(val.lat, val.lng);
    setLocation(prev => ({ ...prev, lat: val.lat, lng: val.lng, address }));
  }, []);

  const saveLocation = async () => {
    if (!location.lat || !location.lng) return;
    setLocSaving(true);
    try {
      await api.patch("/profile/location", {
        lat: location.lat,
        lng: location.lng,
        address: location.address,
        service_radius_km: location.service_radius_km,
      });
      setLocSaved(true);
      setTimeout(() => setLocSaved(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setLocSaving(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile.phone) { alert("Mobile number is required"); return; }
    setSaving(true);
    try {
      await api.patch("/profile", {
        full_name: profile.full_name,
        phone: profile.phone,
        hourly_rate: Number(profile.hourly_rate),
        skills: profile.skills,
        address: profile.address,
        city: profile.city,
        bio: profile.bio,
        notifications_enabled: profile.notifications_enabled,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const toggleSkill = (skill: string) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  const ItemWrapper = tier === "low" ? "div" : motion.div;
  const animProps = tier === "low" ? {} : {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 },
  };

  if (loading) {
    return <div className="p-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-emerald-500" /></div>;
  }

  return (
    <div className="p-4 md:p-8 space-y-6 pb-24 md:pb-8 max-w-2xl mx-auto md:mx-0">
      <header>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">My Profile</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Update your professional details.</p>
      </header>

      {/* ── Location Section ── */}
      <ItemWrapper {...animProps} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-4 h-4 text-emerald-500" />
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider">My Service Location</h3>
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
          Set your exact location so nearby clients can find you. Clients search by distance from their location.
        </p>

        {/* GPS Button */}
        <button
          type="button"
          onClick={detectGPS}
          disabled={gpsLoading}
          className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-60 mb-4"
        >
          {gpsLoading
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Detecting GPS...</>
            : <><Navigation className="w-4 h-4" /> Use My Current Location</>}
        </button>

        {/* GPS Error */}
        {gpsError && (
          <div className="flex items-start gap-2 px-3 py-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 rounded-xl mb-4">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <p className="text-xs text-red-600 dark:text-red-400">{gpsError}</p>
          </div>
        )}

        <p className="text-xs text-zinc-400 text-center mb-3">— or drag the map pin to set manually —</p>

        {/* Map */}
        <div className="rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-700">
          <LocationPicker
            value={location.lat && location.lng ? { lat: location.lat, lng: location.lng } : undefined}
            onChange={handleMapLocation}
            height="200px"
            zoom={14}
          />
        </div>

        {/* Current Coords display */}
        {location.lat && location.lng && (
          <div className="mt-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/40 rounded-xl">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Location Set</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-0.5 break-words">
                  {location.address || `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`}
                </p>
                <p className="text-[10px] text-zinc-400 mt-1">
                  {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Service Radius */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Service Radius</label>
            <span className="text-sm font-bold text-emerald-600">{location.service_radius_km} km</span>
          </div>
          <input
            type="range" min={1} max={25} value={location.service_radius_km}
            onChange={e => setLocation(prev => ({ ...prev, service_radius_km: Number(e.target.value) }))}
            className="w-full h-1.5 rounded-full accent-emerald-600"
          />
          <div className="flex justify-between text-[10px] text-zinc-400 mt-1">
            <span>1 km</span><span>25 km</span>
          </div>
          <p className="text-xs text-zinc-400 mt-1.5">Clients within this distance can find you.</p>
        </div>

        {/* Save Location Button */}
        <button
          type="button"
          onClick={saveLocation}
          disabled={locSaving || !location.lat || !location.lng}
          className="mt-4 w-full flex items-center justify-center gap-2 border-2 border-emerald-600 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-50"
        >
          {locSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> :
           locSaved ? <><CheckCircle2 className="w-4 h-4" /> Location Saved!</> :
           <><Save className="w-4 h-4" /> Save Location</>}
        </button>
      </ItemWrapper>

      {/* ── Profile Form ── */}
      <ItemWrapper {...animProps} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 md:p-8">
        <div className="flex items-center gap-4 mb-8 pb-8 border-b border-zinc-100 dark:border-zinc-800">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-2xl">
            {profile.full_name.charAt(0) || <UserIcon />}
          </div>
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">{profile.full_name}</h2>
            <p className="text-sm text-zinc-500">{profile.email}</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Personal Info</h3>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Full Name</label>
              <input
                type="text" value={profile.full_name}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Phone <span className="text-red-500">*</span></label>
              <input
                type="tel" required value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                placeholder="+91 9876543210"
                className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">City</label>
                <input
                  type="text" value={profile.city}
                  onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                  placeholder="Auto-filled from GPS"
                  className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Address</label>
                <input
                  type="text" value={profile.address}
                  onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                  placeholder="Street, locality..."
                  className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Bio</label>
              <textarea
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                placeholder="Tell clients about yourself and your experience..."
                rows={3}
                className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              />
            </div>
          </div>

          <div className="pt-4 space-y-4 border-t border-zinc-100 dark:border-zinc-800">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Professional Info</h3>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1">
                <IndianRupee className="w-4 h-4" /> Hourly Rate (₹)
              </label>
              <input
                type="number" value={profile.hourly_rate}
                onChange={(e) => setProfile({ ...profile, hourly_rate: Number(e.target.value) })}
                className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2 flex items-center gap-1">
                <Tag className="w-4 h-4" /> Skills
              </label>
              <div className="flex flex-wrap gap-2">
                {ALL_SKILLS.map(skill => {
                  const isSelected = profile.skills.includes(skill);
                  return (
                    <button key={skill} type="button" onClick={() => toggleSkill(skill)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        isSelected
                          ? "bg-emerald-600 text-white"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                      }`}
                    >{skill}</button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider mb-4">Preferences</h3>
            <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700">
              <div>
                <p className="font-semibold text-zinc-900 dark:text-white text-sm">Notifications</p>
                <p className="text-xs text-zinc-500 mt-0.5">Receive alerts for new bookings.</p>
              </div>
              <button
                type="button"
                onClick={() => setProfile({ ...profile, notifications_enabled: !profile.notifications_enabled })}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${profile.notifications_enabled ? "bg-emerald-600" : "bg-zinc-300 dark:bg-zinc-600"}`}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${profile.notifications_enabled ? "translate-x-5" : "translate-x-0"}`} />
              </button>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
            <button
              type="button" onClick={logout}
              className="flex items-center gap-2 text-red-500 hover:text-red-600 border border-red-200 dark:border-red-900/40 hover:bg-red-50 dark:hover:bg-red-900/20 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors w-full sm:w-auto justify-center"
            >
              <LogOut className="w-4 h-4" /> Log Out
            </button>
            <button
              type="submit" disabled={saving}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50 w-full sm:w-auto justify-center"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? "Saved! ✓" : <><Save className="w-4 h-4" /> Save Profile</>}
            </button>
          </div>
        </form>
      </ItemWrapper>
    </div>
  );
}
