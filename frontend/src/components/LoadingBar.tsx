"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function LoadingBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Organic increment from 0 to 100%
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        // Random incremental steps for responsive feel
        const step = Math.floor(Math.random() * 15) + 8;
        const next = prev + step;
        return next > 98 ? 98 : next; // hold at 98% until layout mounts
      });
    }, 100);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-zinc-950 px-6">
      <div className="w-full max-w-xs flex flex-col items-center space-y-6">
        {/* Brand Logo */}
        <Image
          src="/logo.png"
          alt="MaidX Logo"
          width={120}
          height={40}
          className="h-8 w-auto object-contain dark:bg-white/90 dark:px-2 dark:py-1 dark:rounded-lg animate-pulse"
          priority
        />
        
        {/* Progress Bar */}
        <div className="w-full space-y-2">
          <div className="flex justify-between items-center text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">
            <span>Loading...</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 rounded-full transition-all duration-150 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
