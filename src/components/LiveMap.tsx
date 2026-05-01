import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

type OrderStatus = 'confirmed' | 'preparing' | 'ready' | 'picked_up' | 'en_route' | 'arriving' | 'delivered';

interface LiveMapProps {
  status: OrderStatus;
  express: boolean;
  restaurantCoords?: [number, number];
  customerCoords?: [number, number];
}

export const LiveMap = ({ status, express, restaurantCoords = [49.2827, -123.1207], customerCoords = [49.2680, -123.1000] }: LiveMapProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const driverMarkerRef = useRef<L.Marker | null>(null);
  const [mapReady, setMapReady] = useState(false);

  const statusIndex = ['confirmed', 'preparing', 'ready', 'picked_up', 'en_route', 'arriving', 'delivered'].indexOf(status);
  const progress = Math.max(0, Math.min(1, (statusIndex - 2) / 4));

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;
    const centerLat = (restaurantCoords[0] + customerCoords[0]) / 2;
    const centerLng = (restaurantCoords[1] + customerCoords[1]) / 2;
    const map = L.map(mapContainerRef.current, { zoomControl: false, attributionControl: false }).setView([centerLat, centerLng], 14);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { maxZoom: 20, subdomains: 'abcd' }).addTo(map);

    const restaurantIcon = L.divIcon({
      className: 'custom-marker',
      html: `<div style="background:#f97316;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(249,115,22,0.5);border:2px solid white;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.4 2 1 2.8V20a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8.2c.6-.8 1-1.7 1-2.8V2"/><path d="M7 2v5"/><path d="M11 2v5"/><path d="M15 2v5"/></svg></div>`,
      iconSize: [36, 36], iconAnchor: [18, 18],
    });
    const customerIcon = L.divIcon({
      className: 'custom-marker',
      html: `<div style="background:#3b82f6;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(59,130,246,0.5);border:2px solid white;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></div>`,
      iconSize: [36, 36], iconAnchor: [18, 18],
    });

    L.marker(restaurantCoords, { icon: restaurantIcon }).addTo(map).bindPopup('<b>Restaurant</b><br>Pickup location');
    L.marker(customerCoords, { icon: customerIcon }).addTo(map).bindPopup('<b>Your Address</b><br>Delivery location');
    L.polyline([restaurantCoords, customerCoords], { color: '#f97316', weight: 4, opacity: 0.4, dashArray: '10, 10' }).addTo(map);
    map.fitBounds(L.latLngBounds([restaurantCoords, customerCoords]), { padding: [60, 60] });

    mapRef.current = map;
    setMapReady(true);
    return () => { map.remove(); mapRef.current = null; };
  }, [restaurantCoords, customerCoords]);

  useEffect(() => {
    if (!mapRef.current || !mapReady) return;
    if (driverMarkerRef.current) { driverMarkerRef.current.remove(); driverMarkerRef.current = null; }
    if (statusIndex >= 3 && statusIndex < 6) {
      const lat = restaurantCoords[0] + (customerCoords[0] - restaurantCoords[0]) * progress;
      const lng = restaurantCoords[1] + (customerCoords[1] - restaurantCoords[1]) * progress;
      const driverIcon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="background:#f97316;width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 16px rgba(249,115,22,0.6);border:3px solid white;position:relative;"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 11.5V14l-3-3 4-3 2 2h3"/></svg>${express ? '<span style="position:absolute;top:-6px;right:-6px;background:#eab308;color:white;font-size:10px;font-weight:bold;padding:2px 6px;border-radius:999px;border:2px solid white;">EXP</span>' : ''}</div>`,
        iconSize: [44, 44], iconAnchor: [22, 22],
      });
      const driverMarker = L.marker([lat, lng], { icon: driverIcon }).addTo(mapRef.current);
      driverMarkerRef.current = driverMarker;
      const pulseCircle = L.circleMarker([lat, lng], { radius: 18, fillColor: '#f97316', fillOpacity: 0.15, color: '#f97316', weight: 1, opacity: 0.4 }).addTo(mapRef.current);
      let growing = true;
      const pulseInterval = setInterval(() => {
        if (!mapRef.current) { clearInterval(pulseInterval); return; }
        const r = pulseCircle.getRadius();
        pulseCircle.setRadius(growing ? r + 0.5 : r - 0.5);
        if (r >= 28) growing = false;
        if (r <= 15) growing = true;
      }, 80);
      mapRef.current.panTo([lat, lng], { animate: true, duration: 1 });
      return () => { clearInterval(pulseInterval); pulseCircle.remove(); };
    }
  }, [status, progress, mapReady, restaurantCoords, customerCoords, express, statusIndex]);

  return (
    <div className="relative w-full h-80 rounded-2xl overflow-hidden border border-border">
      <div ref={mapContainerRef} className="w-full h-full" />
      <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm rounded-xl px-4 py-2 border border-border shadow-lg z-[400]">
        <div className="flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          <span className="text-sm font-bold">{status === 'delivered' ? 'Delivered' : status === 'arriving' ? '1 min away' : status === 'en_route' ? '8 min away' : status === 'picked_up' ? '12 min away' : 'Preparing'}</span>
        </div>
      </div>
      {express && (
        <div className="absolute top-4 right-4 bg-yellow-500/90 backdrop-blur-sm rounded-xl px-3 py-2 shadow-lg z-[400]">
          <div className="flex items-center gap-1">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            <span className="text-sm font-bold text-white">Express</span>
          </div>
        </div>
      )}
      <div className="absolute bottom-4 left-4 right-4 bg-background/80 backdrop-blur-sm rounded-xl px-4 py-2 border border-border z-[400]">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
          <span>{status === 'en_route' ? 'Turning onto W Georgia St → Homer St → Your address' : status === 'arriving' ? 'Arriving at your address now' : status === 'picked_up' ? 'Leaving restaurant area via Seymour St' : 'Waiting for driver pickup'}</span>
        </div>
      </div>
    </div>
  );
};