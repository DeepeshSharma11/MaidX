"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useDeviceTier } from "@/hooks/useDeviceTier";
import { motion } from "framer-motion";
import { Save, Loader2, User as UserIcon, Tag, IndianRupee, LogOut } from "lucide-react";
import api from "@/lib/api";

const ALL_SKILLS = ["Cleaning", "Cooking", "Laundry", "Baby Care", "Elderly Care", "Pet Care"];

export default function MaidProfilePage() {
  const tier = useDeviceTier();
  const { logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  
  const [profile, setProfile] = useState({ 
    full_name: "", email: "", phone: "", 
    hourly_rate: 0, skills: [] as string[],
    address: "", city: "", bio: "",
    notifications_enabled: true
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
      } catch (err) {
        console.error("Failed to fetch profile", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile.phone) {
      alert("Mobile number is required");
      return;
    }
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
        notifications_enabled: profile.notifications_enabled
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
    setProfile(prev => {
      const skills = prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill];
      return { ...prev, skills };
    });
  };

  const ItemWrapper = tier === "low" ? "div" : motion.div;
  const animProps = tier === "low" ? {} : {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 }
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
                type="text"
                value={profile.full_name}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Phone Number <span className="text-red-500">*</span></label>
              <input
                type="tel"
                required
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                placeholder="+91 9876543210"
                className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">City</label>
                <input
                  type="text"
                  value={profile.city}
                  onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                  placeholder="New Delhi"
                  className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Address</label>
                <input
                  type="text"
                  value={profile.address}
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
                type="number"
                value={profile.hourly_rate}
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
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        isSelected 
                          ? "bg-emerald-600 text-white" 
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                      }`}
                    >
                      {skill}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider mb-4">Preferences</h3>
            <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700">
              <div>
                <p className="font-semibold text-zinc-900 dark:text-white text-sm">System Notifications</p>
                <p className="text-xs text-zinc-500 mt-0.5">Receive alerts for new bookings and messages directly on your device.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const newState = !profile.notifications_enabled;
                  setProfile({ ...profile, notifications_enabled: newState });
                  if (newState && typeof window !== "undefined" && "Notification" in window) {
                    Notification.requestPermission().then(perm => {
                      if (perm === "granted") {
                        new Notification("Notifications Enabled", { body: "You will now receive alerts from MaidX." });
                      }
                    });
                  }
                }}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 ${profile.notifications_enabled ? "bg-emerald-600" : "bg-zinc-300 dark:bg-zinc-600"}`}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${profile.notifications_enabled ? "translate-x-5" : "translate-x-0"}`} />
              </button>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-2 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 border border-red-200 dark:border-red-900/40 hover:bg-red-50 dark:hover:bg-red-900/20 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors w-full sm:w-auto justify-center"
            >
              <LogOut className="w-4 h-4" /> Log Out
            </button>
            <button
              type="submit"
              disabled={saving}
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
