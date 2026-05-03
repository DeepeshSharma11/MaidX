"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useDeviceTier } from "@/hooks/useDeviceTier";
import { motion } from "framer-motion";
import { AlertCircle, MessageSquare, Loader2, CheckCircle2, Clock, XCircle } from "lucide-react";

interface Ticket {
  id: string;
  user_name: string;
  user_role: string;
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

const STATUS_ACTIONS: Record<string, { next: string; label: string; cls: string }[]> = {
  open:        [{ next: "in_progress", label: "Start", cls: "text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 border-amber-300 dark:border-amber-700" }, { next: "closed", label: "Close", cls: "text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 border-zinc-200 dark:border-zinc-700" }],
  in_progress: [{ next: "resolved", label: "Resolve", cls: "text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700" }, { next: "closed", label: "Close", cls: "text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 border-zinc-200 dark:border-zinc-700" }],
  resolved:    [{ next: "closed", label: "Close", cls: "text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 border-zinc-200 dark:border-zinc-700" }],
  closed:      [],
};

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");
  const tier = useDeviceTier();

  async function fetchTickets() {
    try {
      const { data } = await api.get("/tickets");
      setTickets(data.tickets || []);
    } catch (err) {
      console.error("Failed to fetch tickets:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchTickets(); }, []);

  const handleStatusChange = async (ticketId: string, newStatus: string) => {
    setActionLoading(ticketId + newStatus);
    try {
      await api.patch(`/tickets/${ticketId}`, { status: newStatus });
      await fetchTickets();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const ItemWrapper = tier === "low" ? "div" : motion.div;
  const animProps = tier === "low" ? {} : { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.2 } };

  const filtered = filter === "all" ? tickets : tickets.filter(t => t.status === filter);

  const counts = tickets.reduce((acc, t) => { acc[t.status] = (acc[t.status] || 0) + 1; return acc; }, {} as Record<string, number>);

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-amber-500" /></div>;

  return (
    <div className="p-4 md:p-8 space-y-6 pb-24 md:pb-8">
      <header>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Support Tickets</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Manage and resolve issues reported by users.</p>
      </header>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(["all", "open", "in_progress", "resolved"] as const).map(s => {
          const count = s === "all" ? tickets.length : (counts[s] || 0);
          const cfg = s === "all" ? null : STATUS_CONFIG[s];
          return (
            <button key={s} onClick={() => setFilter(s)}
              className={`bg-white dark:bg-zinc-900 border rounded-2xl p-4 text-left transition-all ${
                filter === s
                  ? "border-amber-400 dark:border-amber-500 shadow-sm"
                  : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300"
              }`}>
              <p className="text-2xl font-bold text-zinc-900 dark:text-white">{count}</p>
              <p className="text-xs text-zinc-500 capitalize mt-0.5">{s === "all" ? "Total" : s.replace("_", " ")}</p>
            </button>
          );
        })}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-none">
        {["all", "open", "in_progress", "resolved", "closed"].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium capitalize transition-colors ${
              filter === s ? "bg-amber-500 text-white" : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700"
            }`}>{s.replace("_", " ")}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
          <MessageSquare className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto mb-3" />
          <p className="font-semibold text-zinc-700 dark:text-zinc-300 mb-1">No tickets found</p>
          <p className="text-sm text-zinc-500">{filter === "all" ? "No support tickets yet." : `No ${filter.replace("_", " ")} tickets.`}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((ticket, idx) => {
            const s = STATUS_CONFIG[ticket.status] ?? STATUS_CONFIG.open;
            const StatusIcon = s.icon;
            const actions = STATUS_ACTIONS[ticket.status] ?? [];
            return (
              <ItemWrapper key={ticket.id} {...animProps} transition={tier !== "low" ? { delay: idx * 0.04 } : undefined}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 flex flex-col gap-3">

                <div className="flex justify-between items-center">
                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${s.cls}`}>
                    <StatusIcon className="w-3 h-3" /> {s.label}
                  </span>
                  <span className="text-xs text-zinc-400">
                    {new Date(ticket.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-zinc-900 dark:text-white text-sm line-clamp-1">{ticket.subject}</h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-3 mt-1">{ticket.description}</p>
                </div>

                {/* User info */}
                <div className="flex items-center gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <div className="w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-xs font-bold text-amber-700 dark:text-amber-400">
                    {(ticket.user_name || "?").charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-zinc-900 dark:text-white truncate">{ticket.user_name || "Unknown"}</p>
                    <p className="text-[10px] text-zinc-500 capitalize">{ticket.user_role}</p>
                  </div>
                </div>

                {/* Action buttons */}
                {actions.length > 0 && (
                  <div className="flex gap-2">
                    {actions.map(action => (
                      <button key={action.next}
                        onClick={() => handleStatusChange(ticket.id, action.next)}
                        disabled={!!actionLoading}
                        className={`flex-1 flex items-center justify-center gap-1 text-xs font-semibold px-3 py-2 rounded-xl border transition-colors disabled:opacity-50 ${action.cls}`}>
                        {actionLoading === ticket.id + action.next
                          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          : action.label}
                      </button>
                    ))}
                  </div>
                )}
              </ItemWrapper>
            );
          })}
        </div>
      )}
    </div>
  );
}
