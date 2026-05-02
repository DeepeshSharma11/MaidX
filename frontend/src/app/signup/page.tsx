"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, Star, CheckCircle2, ArrowLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";

const ROLES = [
  { value: "client", label: "I need help 🏠", desc: "Hire trusted domestic workers" },
  { value: "maid", label: "I provide services 🧹", desc: "Offer your professional skills" },
];

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading, signup } = useAuth();

  useEffect(() => {
    if (user && !authLoading) {
      router.replace(`/dashboard/${user.role}`);
    }
  }, [user, authLoading, router]);

  // If redirected from login with unverified account
  const urlEmail = searchParams.get("email") ?? "";
  const urlStep = searchParams.get("step") as "form" | "otp" | null;

  const [step, setStep] = useState<"form" | "otp" | "success">(urlStep === "otp" ? "otp" : "form");
  const [role, setRole] = useState("client");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState(urlEmail);
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // OTP state
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      // Call API directly to inspect requires_otp flag
      const { data } = await api.post("/auth/signup", { email, password, full_name: fullName, role });
      if (data.requires_otp) {
        setStep("otp");
      }
    } catch (err: any) {
      setError(err.response?.data?.detail ?? "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newOtp = [...otp];
    for (let i = 0; i < pasted.length; i++) newOtp[i] = pasted[i];
    setOtp(newOtp);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleVerifyOtp = async () => {
    const code = otp.join("");
    if (code.length !== 6) {
      setError("Please enter the complete 6-digit OTP.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await api.post("/auth/verify-otp", { email, otp: code });
      setStep("success");
    } catch (err: any) {
      setError(err.response?.data?.detail ?? "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setError("");
    try {
      await api.post("/auth/resend-otp", { email });
      setError("");
      setOtp(["", "", "", "", "", ""]);
    } catch (err: any) {
      setError(err.response?.data?.detail ?? "Could not resend OTP.");
    } finally {
      setLoading(false);
    }
  };

  // ── Success Screen ──
  if (step === "success") {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-10 max-w-md w-full text-center shadow-2xl"
        >
          <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-9 h-9 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Account Verified! 🎉</h2>
          <p className="text-zinc-500 dark:text-zinc-400 mb-6">
            Your email has been verified. You can now log in and start using MaidX.
          </p>
          <button
            onClick={() => router.push("/login")}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-xl transition-all active:scale-95"
          >
            Go to Login
          </button>
        </motion.div>
      </div>
    );
  }

  // ── OTP Screen ──
  if (step === "otp") {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex items-center justify-center px-4">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-500/15 blur-[100px] rounded-full" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="relative w-full max-w-md"
        >
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl p-8">
            <button
              onClick={() => setStep("form")}
              className="flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-200 mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>

            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Verify your email</h1>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                We sent a 6-digit code to <span className="font-medium text-zinc-700 dark:text-zinc-200">{email}</span>
              </p>
            </div>

            {error && (
              <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* OTP Input */}
            <div className="flex justify-center gap-3 mb-6" onPaste={handleOtpPaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  className="w-12 h-14 text-center text-xl font-bold rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              ))}
            </div>

            <button
              onClick={handleVerifyOtp}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 text-white font-medium py-3 rounded-xl transition-all active:scale-95"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {loading ? "Verifying..." : "Verify OTP"}
            </button>

            <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 mt-5">
              Didn&apos;t receive the code?{" "}
              <button onClick={handleResendOtp} disabled={loading} className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
                Resend
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Signup Form ──
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex items-center justify-center px-4 py-10">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-500/15 blur-[100px] rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative w-full max-w-md"
      >
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl p-8">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Star className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-zinc-900 dark:text-white">MaidX</span>
          </div>

          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-1">Create your account</h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-6">Join thousands of families and professionals</p>

          <div className="grid grid-cols-2 gap-3 mb-6">
            {ROLES.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setRole(r.value)}
                className={`p-4 rounded-2xl border-2 text-left transition-all ${
                  role === r.value
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10"
                    : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600"
                }`}
              >
                <div className="font-semibold text-zinc-900 dark:text-white text-sm mb-0.5">{r.label}</div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400">{r.desc}</div>
              </button>
            ))}
          </div>

          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Full Name</label>
              <input
                type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required placeholder="Priya Sharma"
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Email</label>
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} placeholder="Min. 8 characters"
                  className="w-full px-4 py-3 pr-11 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 text-white font-medium py-3 px-4 rounded-xl transition-all active:scale-95 mt-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
