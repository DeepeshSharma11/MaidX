"use client";

import { useState, useEffect } from "react";

export type DeviceTier = "high" | "mid" | "low";

export function useDeviceTier(): DeviceTier {
  // Default to "low" — upgrade after hydration. Prevents flash of heavy animations.
  const [tier, setTier] = useState<DeviceTier>("low");

  useEffect(() => {
    if (typeof navigator === "undefined") return;

    const cores = navigator.hardwareConcurrency ?? 4;
    const memory = (navigator as any).deviceMemory ?? 4;

    // Treat save-data / slow connections as low tier
    const conn = (navigator as any).connection;
    const slowNetwork = conn && (conn.saveData || ["slow-2g", "2g"].includes(conn.effectiveType));

    if (slowNetwork) {
      setTier("low");
    } else if (cores >= 8 && memory >= 8) {
      setTier("high");
    } else if (cores >= 6 && memory >= 4) {
      setTier("mid");
    } else {
      setTier("low"); // Most budget/mid-range Androids fall here
    }
  }, []);

  return tier;
}
