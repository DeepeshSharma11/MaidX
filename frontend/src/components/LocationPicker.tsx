"use client";

import "leaflet/dist/leaflet.css";

import { useEffect, useRef } from "react";
import { MapPin } from "lucide-react";

interface LocationPickerProps {
  value?: { lat: number; lng: number; address?: string };
  onChange: (loc: { lat: number; lng: number; address?: string }) => void;
  height?: string;
  zoom?: number;
}

export default function LocationPicker({
  value,
  onChange,
  height = "280px",
  zoom = 14,
}: LocationPickerProps) {
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Default: India center
  const defaultLat = value?.lat ?? 20.5937;
  const defaultLng = value?.lng ?? 78.9629;

  useEffect(() => {
    if (typeof window === "undefined" || mapRef.current) return;

    const L = require("leaflet");

    // Fix default icon paths in Next.js
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });

    const map = L.map(containerRef.current!, {
      center: [defaultLat, defaultLng],
      zoom,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>',
    }).addTo(map);

    const marker = L.marker([defaultLat, defaultLng], { draggable: true }).addTo(map);
    markerRef.current = marker;
    mapRef.current = map;

    const updateLocation = async (lat: number, lng: number) => {
      marker.setLatLng([lat, lng]);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
        );
        const data = await res.json();
        const address = data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        onChange({ lat, lng, address });
      } catch {
        onChange({ lat, lng });
      }
    };

    marker.on("dragend", (e: any) => {
      const { lat, lng } = e.target.getLatLng();
      updateLocation(lat, lng);
    });

    map.on("click", (e: any) => {
      const { lat, lng } = e.latlng;
      updateLocation(lat, lng);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update marker if value changes externally
  useEffect(() => {
    if (markerRef.current && value) {
      markerRef.current.setLatLng([value.lat, value.lng]);
      mapRef.current?.panTo([value.lat, value.lng]);
    }
  }, [value?.lat, value?.lng]);

  const handleGeolocate = () => {
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const { latitude: lat, longitude: lng } = coords;
        if (mapRef.current) {
          mapRef.current.flyTo([lat, lng], 15);
        }
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        }
        onChange({ lat, lng, address: "Current location" });
      },
      () => alert("Could not get your location.")
    );
  };

  return (
    <div className="relative rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-700 shadow-sm">
      <div ref={containerRef} style={{ height, width: "100%" }} />

      {/* Geolocate button */}
      <button
        type="button"
        onClick={handleGeolocate}
        className="absolute bottom-3 right-3 z-[1000] flex items-center gap-1.5 bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-sm font-medium shadow-md hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
      >
        <MapPin className="w-4 h-4" />
        Use my location
      </button>
    </div>
  );
}
