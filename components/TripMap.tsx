"use client";
import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

type Pin = { name: string; lat: number; lng: number };

export default function TripMap({ pins, route = false, className = "" }: { pins: Pin[]; route?: boolean; className?: string }) {
  const el = useRef<HTMLDivElement>(null);
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  useEffect(() => {
    if (!token || !el.current || pins.length === 0) return;
    mapboxgl.accessToken = token;
    const map = new mapboxgl.Map({ container: el.current, style: "mapbox://styles/mapbox/light-v11", center: [pins[0].lng, pins[0].lat], zoom: 11 });
    const bounds = new mapboxgl.LngLatBounds();
    pins.forEach((p, i) => {
      bounds.extend([p.lng, p.lat]);
      let marker: mapboxgl.Marker;
      if (route) {
        const dot = document.createElement("div");
        dot.className = "grid h-7 w-7 place-items-center rounded-full bg-navy text-xs font-medium text-white ring-2 ring-white";
        dot.textContent = String(i + 1);
        marker = new mapboxgl.Marker({ element: dot });
      } else {
        marker = new mapboxgl.Marker({ color: "#13233F" });
      }
      marker.setLngLat([p.lng, p.lat]).setPopup(new mapboxgl.Popup().setText(p.name)).addTo(map);
    });
    map.fitBounds(bounds, { padding: 60, maxZoom: 14 });
    if (route && pins.length > 1) {
      map.on("load", () => {
        map.addSource("route", { type: "geojson", data: { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: pins.map((p) => [p.lng, p.lat]) } } });
        map.addLayer({ id: "route", type: "line", source: "route", paint: { "line-color": "#13233F", "line-width": 3, "line-dasharray": [2, 2] } });
      });
    }
    return () => map.remove();
  }, [token, pins, route]);

  if (!token) return <div className={`grid place-items-center bg-sand text-sm text-navy-600 ${className}`}>Add NEXT_PUBLIC_MAPBOX_TOKEN to show the map</div>;
  return <div ref={el} className={className} />;
}