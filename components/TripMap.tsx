"use client";
import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

type Pin = { name: string; lat: number; lng: number };

export default function TripMap({ pins, className = "" }: { pins: Pin[]; className?: string }) {
  const el = useRef<HTMLDivElement>(null);
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  useEffect(() => {
    if (!token || !el.current || pins.length === 0) return;
    mapboxgl.accessToken = token;
    const map = new mapboxgl.Map({ container: el.current, style: "mapbox://styles/mapbox/light-v11", center: [pins[0].lng, pins[0].lat], zoom: 11 });
    const bounds = new mapboxgl.LngLatBounds();
    pins.forEach((p) => {
      bounds.extend([p.lng, p.lat]);
      new mapboxgl.Marker({ color: "#13233F" }).setLngLat([p.lng, p.lat]).setPopup(new mapboxgl.Popup().setText(p.name)).addTo(map);
    });
    map.fitBounds(bounds, { padding: 60, maxZoom: 14 });
    return () => map.remove();
  }, [token, pins]);

  if (!token) return <div className={`grid place-items-center bg-sand text-sm text-navy-600 ${className}`}>Add NEXT_PUBLIC_MAPBOX_TOKEN to show the map</div>;
  return <div ref={el} className={className} />;
}
