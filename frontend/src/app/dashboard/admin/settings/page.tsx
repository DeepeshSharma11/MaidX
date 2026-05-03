"use client";

import { useEffect, useState } from "react";
import { useDeviceTier } from "@/hooks/useDeviceTier";
import { motion } from "framer-motion";
import { Save, Loader2, Key, Bell, Shield, CheckCircle2, Eye, EyeOff, LogOut } from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 ${enabled ? "bg-indigo-600" : "bg-zinc-300 dark:bg-zinc-600"}`}
    >
      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${enabled ? "translate-x-5" : "translate-x-0"}`} />
    </button>
  );
}

export default function AdminSettingsPage() {
  const { user, logout } = useAuth();
  const tier = useDeviceTier();

  // Notification prefs
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Password change
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [pwSuccess, setPwSuccess] = useState("");
  const [pwError, setPwError] = useState("");

  const ItemWrapper = tier === "low" ? "div" : motion.div;
  const animProps = tier === "low" ? {} : { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3 } };

  useEffect(() => {
    async function fetchSettings() {
      try {
        const { data } = await api.get("/profile");
        setNotifEnabled(data.notifications_enabled ?? true);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingSettings(false);
      }
    }
    fetchSettings();
  }, []);

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      await api.patch("/admin/settings", { notifications_enabled: notifEnabled });
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError("");
    setPwSuccess("");
    if (newPw.length < 8) { setPwError("New password must be at least 8 characters."); return; }
    if (newPw !== confirmPw) { setPwError("Passwords do not match."); return; }
    setSavingPw(true);
    try {
      await api.post("/admin/settings/change-password", { current_password: currentPw, new_password: newPw });
      setPwSuccess("Password changed successfully!");
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
    } catch (err: any) {
      setPwError(err?.response?.data?.detail || "Failed to change password.");
    } finally {
      setSavingPw(false);
    }
  };

  if (loadingSettings) {
    return <div className="p-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-indigo-500" /></div>;
  }

  const inputCls = "w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500";

  return (
    <div className="p-4 md:p-8 space-y-6 pb-24 md:pb-8 max-w-3xl">
      <header>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Admin Settings</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Manage platform preferences and account security.</p>
      </header>

      {/* Notifications */}
      <ItemWrapper {...animProps} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 md:p-8 space-y-5">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
          <Bell className="w-5 h-5 text-indigo-500" /> Notifications
        </h2>

        <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700">
          <div>
            <p className="font-medium text-zinc-900 dark:text-white text-sm">System Notifications</p>
            <p className="text-xs text-zinc-500 mt-0.5">Receive push notifications for new tickets, user activity, and alerts.</p>
          </div>
          <Toggle enabled={notifEnabled} onChange={(v) => {
            setNotifEnabled(v);
            if (v && typeof window !== "undefined" && "Notification" in window) {
              Notification.requestPermission().then(perm => {
                if (perm === "granted") new Notification("Admin Notifications Enabled", { body: "You'll receive platform alerts on this device." });
              });
            }
          }} />
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSaveSettings}
            disabled={savingSettings}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50"
          >
            {savingSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : settingsSaved ? <><CheckCircle2 className="w-4 h-4" /> Saved!</> : <><Save className="w-4 h-4" /> Save Preferences</>}
          </button>
        </div>
      </ItemWrapper>

      {/* Change Password */}
      <ItemWrapper {...animProps} transition={tier !== "low" ? { delay: 0.1 } : undefined} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 md:p-8 space-y-5">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
          <Key className="w-5 h-5 text-indigo-500" /> Change Password
        </h2>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Current Password</label>
            <div className="relative">
              <input type={showCurrent ? "text" : "password"} value={currentPw} onChange={e => setCurrentPw(e.target.value)} required className={inputCls + " pr-10"} placeholder="••••••••" />
              <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-600">
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">New Password</label>
            <div className="relative">
              <input type={showNew ? "text" : "password"} value={newPw} onChange={e => setNewPw(e.target.value)} required className={inputCls + " pr-10"} placeholder="Min 8 characters" />
              <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-600">
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Confirm New Password</label>
            <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} required className={inputCls} placeholder="Repeat new password" />
          </div>

          {pwError && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-4 py-3 rounded-xl">{pwError}</p>}
          {pwSuccess && <p className="text-sm text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-3 rounded-xl flex items-center gap-2"><CheckCircle2 className="w-4 h-4" />{pwSuccess}</p>}

          <div className="flex justify-end">
            <button type="submit" disabled={savingPw} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50">
              {savingPw ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Shield className="w-4 h-4" /> Update Password</>}
            </button>
          </div>
        </form>
      </ItemWrapper>

      {/* Account Info */}
      <ItemWrapper {...animProps} transition={tier !== "low" ? { delay: 0.2 } : undefined} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 md:p-8 space-y-3">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
          <Shield className="w-5 h-5 text-amber-500" /> Account Info
        </h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800">
            <p className="text-zinc-500 text-xs mb-1">Name</p>
            <p className="font-medium text-zinc-900 dark:text-white">{user?.full_name || "—"}</p>
          </div>
          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800">
            <p className="text-zinc-500 text-xs mb-1">Role</p>
            <p className="font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wider text-xs">Administrator</p>
          </div>
        </div>
      </ItemWrapper>

      {/* Logout */}
      <ItemWrapper {...animProps} transition={tier !== "low" ? { delay: 0.3 } : undefined}
        className="bg-white dark:bg-zinc-900 border border-red-200 dark:border-red-900/40 rounded-2xl p-5 md:p-8 space-y-4">
        <h2 className="text-base font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
          <LogOut className="w-5 h-5" /> Account
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Log out from your account on this device.</p>
        <button
          type="button"
          onClick={logout}
          className="flex items-center gap-2 text-red-600 dark:text-red-400 border border-red-300 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
        >
          <LogOut className="w-4 h-4" /> Log Out
        </button>
      </ItemWrapper>
    </div>
  );
}
