"use client";

import { useEffect, useState } from "react";
import { useDeviceTier } from "@/hooks/useDeviceTier";
import { motion } from "framer-motion";
import { Send, Loader2, MessageSquare, PhoneCall, HelpCircle, AlertCircle, CheckCircle2, Clock, XCircle } from "lucide-react";
import api from "@/lib/api";

interface Ticket {
  id: string;
  subject: string;
  description: string;
  status: string;
  created_at: string;
}

const STATUS_CONFIG: Record<string, { cls: string; icon: React.ElementType; label: string }> = {
  open:        { cls: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",         icon: AlertCircle,   label: "Open" },
  in_progress: { cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",  icon: Clock,         label: "In Progress" },
  resolved:    { cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400", icon: CheckCircle2, label: "Resolved" },
  closed:      { cls: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",         icon: XCircle,       label: "Closed" },
};

export default function MaidSupportPage() {
  const tier = useDeviceTier();
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(true);

  const ItemWrapper = tier === "low" ? "div" : motion.div;
  const animProps = tier === "low" ? {} : { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3 } };

  async function fetchTickets() {
    try {
      const { data } = await api.get("/tickets");
      setTickets(data.tickets || []);
    } catch (err) { console.error(err); }
    finally { setTicketsLoading(false); }
  }

  useEffect(() => { fetchTickets(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return;
    setLoading(true); setError("");
    try {
      await api.post("/tickets", { subject: subject.trim(), description: description.trim() });
      setSuccess(true); setSubject(""); setDescription("");
      fetchTickets();
      setTimeout(() => setSuccess(false), 4000);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to submit ticket.");
    } finally { setLoading(false); }
  };

  return (
    <div className="p-4 md:p-8 space-y-6 pb-24 md:pb-8 max-w-4xl mx-auto md:mx-0">
      <header>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Help & Support</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Need help? Submit a ticket and we'll respond soon.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-3">
              <MessageSquare className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="font-bold text-zinc-900 dark:text-white text-sm">Submit Ticket</h3>
            <p className="text-xs text-zinc-500 mt-1">We respond within 24h</p>
          </div>
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-3">
              <PhoneCall className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="font-bold text-zinc-900 dark:text-white text-sm">Call Support</h3>
            <p className="text-xs text-zinc-500 mt-1">+91 1800-123-4567</p>
          </div>
        </div>

        <ItemWrapper {...animProps} className="md:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 md:p-8">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-5 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-emerald-500" /> Submit a Request
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Subject</label>
              <input type="text" required value={subject} onChange={e => setSubject(e.target.value)}
                placeholder="E.g. Payment issue or booking problem"
                className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Description</label>
              <textarea required rows={4} value={description} onChange={e => setDescription(e.target.value)}
                placeholder="Describe your issue in detail..."
                className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none" />
            </div>
            {error && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-xl">{error}</p>}
            {success && <p className="text-sm text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2 rounded-xl flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Ticket submitted!</p>}
            <div className="pt-1 flex justify-end">
              <button type="submit" disabled={loading || success}
                className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50 w-full md:w-auto">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4" /> Submit Ticket</>}
              </button>
            </div>
          </form>
        </ItemWrapper>
      </div>

      <div className="space-y-4">
        <h2 className="text-base font-bold text-zinc-900 dark:text-white">My Tickets</h2>
        {ticketsLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-emerald-400" /></div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-10 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
            <MessageSquare className="w-10 h-10 text-zinc-300 dark:text-zinc-700 mx-auto mb-2" />
            <p className="text-sm text-zinc-500">No tickets submitted yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {tickets.map((ticket, idx) => {
              const s = STATUS_CONFIG[ticket.status] ?? STATUS_CONFIG.open;
              const StatusIcon = s.icon;
              return (
                <ItemWrapper key={ticket.id} {...animProps} transition={tier !== "low" ? { delay: idx * 0.04 } : undefined}
                  className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${s.cls}`}>
                      <StatusIcon className="w-3 h-3" /> {s.label}
                    </span>
                    <span className="text-xs text-zinc-400">
                      {new Date(ticket.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </span>
                  </div>
                  <h3 className="font-semibold text-zinc-900 dark:text-white text-sm line-clamp-1">{ticket.subject}</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">{ticket.description}</p>
                </ItemWrapper>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
