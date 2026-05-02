"use client";

import { useState } from "react";
import { Search, MoreVertical, Filter } from "lucide-react";

const MOCK_USERS = [
  { id: "1", name: "John Doe", email: "john@example.com", role: "client", status: "active" },
  { id: "2", name: "Anita Smith", email: "anita@example.com", role: "maid", status: "active", verified: true },
  { id: "3", name: "David Kim", email: "david@example.com", role: "client", status: "inactive" },
  { id: "4", name: "Priya Sharma", email: "priya@example.com", role: "maid", status: "active", verified: false },
];

export default function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = MOCK_USERS.filter((u) => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Manage Users</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">View and manage all registered users.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input 
              type="text" 
              placeholder="Search users..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button className="p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl">
            <Filter className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
          </button>
        </div>
      </header>

      {/* Mobile Card View / Desktop Table View */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden">
        {/* Desktop Header */}
        <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
          <div className="col-span-4">User</div>
          <div className="col-span-3">Role</div>
          <div className="col-span-3">Status</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {/* List */}
        <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {filteredUsers.map((user) => (
            <div key={user.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 items-center">
              <div className="col-span-1 md:col-span-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-sm text-zinc-900 dark:text-white">{user.name}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{user.email}</p>
                </div>
              </div>
              
              <div className="col-span-1 md:col-span-3 flex items-center justify-between md:block">
                <span className="md:hidden text-xs text-zinc-500">Role:</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-zinc-700 dark:text-zinc-300 capitalize">{user.role}</span>
                  {user.role === 'maid' && user.verified && (
                    <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 px-1.5 py-0.5 rounded-full font-medium">Verified</span>
                  )}
                </div>
              </div>

              <div className="col-span-1 md:col-span-3 flex items-center justify-between md:block">
                <span className="md:hidden text-xs text-zinc-500">Status:</span>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  user.status === 'active' 
                    ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                    : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400'
                }`}>
                  {user.status}
                </span>
              </div>

              <div className="col-span-1 md:col-span-2 flex justify-end md:block text-right mt-2 md:mt-0">
                <button className="p-1.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
