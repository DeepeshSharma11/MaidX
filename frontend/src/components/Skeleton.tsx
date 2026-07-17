import React from "react";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
}

export default function Skeleton({
  variant = "rectangular",
  width,
  height,
  className = "",
  ...props
}: SkeletonProps) {
  const baseStyles = "bg-zinc-200 dark:bg-zinc-800 animate-pulse";

  const shape = {
    text: "rounded h-4 w-full",
    circular: "rounded-full",
    rectangular: "rounded-2xl",
  }[variant];

  return (
    <div
      className={`${baseStyles} ${shape} ${className}`}
      style={{ width, height }}
      {...props}
    />
  );
}

// Reusable custom skeleton placeholder for Maid cards
export function MaidCardSkeleton() {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 flex items-start gap-3">
      <Skeleton variant="circular" className="w-11 h-11 shrink-0 rounded-xl" />
      <div className="flex-1 space-y-2 min-w-0">
        <Skeleton variant="text" width="60%" height="16px" />
        <div className="flex gap-2 items-center">
          <Skeleton variant="text" width="40px" height="12px" />
          <Skeleton variant="text" width="30px" height="10px" />
        </div>
        <Skeleton variant="text" width="85%" height="10px" className="mt-1" />
      </div>
    </div>
  );
}

// Reusable custom skeleton placeholder for Booking cards
export function BookingCardSkeleton() {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-4 shadow-sm animate-pulse">
      <div className="flex justify-between items-center pb-3 border-b border-zinc-100 dark:border-zinc-800">
        <div className="space-y-1.5 flex-1">
          <Skeleton variant="text" width="140px" height="18px" />
          <Skeleton variant="text" width="95px" height="12px" />
        </div>
        <Skeleton variant="rectangular" width="70px" height="22px" className="rounded-full shrink-0" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Skeleton variant="text" width="50px" height="10px" />
          <Skeleton variant="text" width="100px" height="14px" />
        </div>
        <div className="space-y-1.5">
          <Skeleton variant="text" width="50px" height="10px" />
          <Skeleton variant="text" width="100px" height="14px" />
        </div>
      </div>
    </div>
  );
}
