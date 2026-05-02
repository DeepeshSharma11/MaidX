"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useDeviceTier } from "@/hooks/useDeviceTier";
import { motion } from "framer-motion";
import { AlertCircle, MessageSquare, Loader2, Plus } from "lucide-react";

interface Ticket {
  id: string;
  user_name: string;
  user_role: string;
  subject: string;
  description: string;
  status: string;
  created_at: string;
}

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const tier = useDeviceTier();

  useEffect(() => {
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
    fetchTickets();
  }, []);

  const ItemWrapper = tier === "low" ? "div" : motion.div;
  const animProps = tier === "low" ? {} : {
    initial: { opacity: 0, scale: 0.98 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.2 }
  };

  if (loading) {
    return <div className="p-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-amber-500" /></div>;
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Support Tickets</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Manage issues reported by users.</p>
        </div>
        <button className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors w-fit">
          <Plus className="w-4 h-4" />
          Create Ticket
        </button>
      </header>

      {tickets.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
          <MessageSquare className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-500 dark:text-zinc-400">No support tickets found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {tickets.map((ticket, idx) => (
            <ItemWrapper
              key={ticket.id}
              {...animProps}
              transition={tier !== "low" ? { delay: idx * 0.05 } : undefined}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5"
            >
              <div className="flex justify-between items-start mb-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${ticket.status === 'open' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'}`}>
                  {ticket.status}
                </span>
                <span className="text-xs text-zinc-400">{new Date(ticket.created_at).toLocaleDateString()}</span>
              </div>
              <h3 className="font-bold text-zinc-900 dark:text-white mb-1 line-clamp-1">{ticket.subject}</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-3 mb-4">{ticket.description}</p>
              
              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-xs font-bold">
                    {ticket.user_name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-zinc-900 dark:text-white">{ticket.user_name}</p>
                    <p className="text-[10px] text-zinc-500 capitalize">{ticket.user_role}</p>
                  </div>
                </div>
                <button className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline">
                  View details
                </button>
              </div>
            </ItemWrapper>
          ))}
        </div>
      )}
    </div>
  );
}
