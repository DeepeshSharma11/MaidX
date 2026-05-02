"use client";

import { useState, useEffect } from "react";

export type DeviceTier = "high" | "mid" | "low";

/**
 * Returns a device tier based on hardware concurrency and memory.
 * Can be used to toggle heavy animations off for low-end devices.
 */
export function useDeviceTier() {
  const [tier, setTier] = useState<DeviceTier>("mid");

  useEffect(() => {
    if (typeof navigator === "undefined") return;

    let cpuCores = 4;
    let memory = 4;

    if ("hardwareConcurrency" in navigator) {
      cpuCores = navigator.hardwareConcurrency as number;
    }

    if ("deviceMemory" in navigator) {
      memory = (navigator as any).deviceMemory as number;
    }

    if (cpuCores >= 8 && memory >= 8) {
      setTier("high");
    } else if (cpuCores <= 4 && memory <= 4) {
      setTier("low");
    } else {
      setTier("mid");
    }
  }, []);

  return tier;
}
