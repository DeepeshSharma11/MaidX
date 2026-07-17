import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: "default" | "muted";
  hoverEffect?: boolean;
  roundedSize?: "2xl" | "3xl" | "none";
  paddingSize?: "normal" | "large" | "none";
}

export default function Card({
  children,
  variant = "default",
  hoverEffect = false,
  roundedSize = "2xl",
  paddingSize = "normal",
  className = "",
  ...props
}: CardProps) {
  const baseStyles = variant === "muted"
    ? "bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800"
    : "bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm";

  const rounding = {
    "2xl": "rounded-2xl",
    "3xl": "rounded-3xl",
    "none": "",
  }[roundedSize];

  const padding = {
    "normal": "p-6",
    "large": "p-6 md:p-10",
    "none": "",
  }[paddingSize];

  const hover = hoverEffect
    ? "hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
    : "";

  return (
    <div
      className={`${baseStyles} ${rounding} ${padding} ${hover} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
