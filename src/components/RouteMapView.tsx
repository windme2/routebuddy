'use client';

import { useEffect, useRef, useState } from 'react';
import { Activity } from '@/generated/prisma/client';
import { MapPin, Loader2, AlertCircle, Clock, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

interface RouteMapProps {
  activities: Activity[];
  tripName: string;
}

interface GeocodedActivity {
  activity: Activity;
  lat: number;
  lng: number;
  index: number;
}

// Nominatim geocoding — free, no API key needed
async function geocodeLocation(location: string): Promise<[number, number] | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`;
    const res = await fetch(url, {
      headers: { 'Accept-Language': 'th,en', 'User-Agent': 'RouteBuddy/1.0' },
    });
    const data = await res.json();
    if (data && data.length > 0) {
      return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
    }
    return null;
  } catch {
    return null;
  }
}

// Colors for the route markers
const ROUTE_COLORS = [
  '#3B82F6', '#8B5CF6', '#EC4899', '#EF4444', '#F59E0B',
  '#10B981', '#06B6D4', '#F97316', '#6366F1', '#14B8A6',
];

export default function RouteMapView({ activities, tripName }: RouteMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<import('leaflet').Map | null>(null);
  const [geocoded, setGeocoded] = useState<GeocodedActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  // Filter activities that have location text
  const locActivities = activities
    .filter(a => a.location && a.location.trim())
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  // Geocode all locations
  useEffect(() => {
    if (locActivities.length === 0) return;
    setLoading(true);
    setGeocoded([]);
    setProgress(0);
    setError(null);

    let cancelled = false;

    const runGeocode = async () => {
      const results: GeocodedActivity[] = [];
      for (let i = 0; i < locActivities.length; i++) {
        if (cancelled) break;
        const coords = await geocodeLocation(locActivities[i].location!);
        setProgress(Math.round(((i + 1) / locActivities.length) * 100));
        if (coords) {
          results.push({ activity: locActivities[i], lat: coords[0], lng: coords[1], index: i });
        }
        // Nominatim rate limit: 1 request/second
        if (i < locActivities.length - 1) await new Promise(r => setTimeout(r, 1100));
      }
      if (!cancelled) {
        setGeocoded(results);
        setLoading(false);
      }
    };

    runGeocode();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activities.map(a => a.id + a.location).join(',')]);

  // Build Leaflet map after geocoding
  useEffect(() => {
    if (!mapRef.current || geocoded.length === 0) return;
    if (typeof window === 'undefined') return;

    // Dynamically load Leaflet (no SSR)
    import('leaflet').then(L => {
      // Fix icon path issue with Webpack/Next.js
      delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      // Remove existing map
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }

      const map = L.map(mapRef.current!);
      leafletMapRef.current = map;

      // OpenStreetMap tiles — completely free
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map);

      const latlngs: [number, number][] = geocoded.map(g => [g.lat, g.lng]);

      // Draw the route polyline with animated dashes
      L.polyline(latlngs, {
        color: '#3B82F6',
        weight: 3,
        opacity: 0.8,
        dashArray: '8, 6',
      }).addTo(map);

      // Draw solid thin lines between markers too
      L.polyline(latlngs, {
        color: '#93C5FD',
        weight: 1.5,
        opacity: 0.4,
      }).addTo(map);

      // Add numbered markers with custom HTML
      geocoded.forEach((g, i) => {
        const color = ROUTE_COLORS[i % ROUTE_COLORS.length];
        const isFirst = i === 0;
        const isLast = i === geocoded.length - 1;

        const icon = L.divIcon({
          html: `<div style="
            width: 32px; height: 32px;
            background: ${color};
            border: 3px solid white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 13px; font-weight: 700; color: white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            ${isFirst || isLast ? 'border-width: 4px; width: 36px; height: 36px;' : ''}
          ">${i + 1}</div>`,
          iconSize: [36, 36],
          iconAnchor: [18, 18],
          className: '',
        });

        const actDate = format(new Date(g.activity.date), 'EEE d MMM', { locale: th });
        const startT = format(new Date(g.activity.startTime), 'HH:mm');
        const endT = format(new Date(g.activity.endTime), 'HH:mm');

        const popupHtml = `
          <div style="min-width:180px; font-family: inherit;">
            <div style="display:flex; align-items:center; gap:6px; margin-bottom:6px;">
              <span style="background:${color}; color:white; border-radius:50%; width:22px; height:22px; display:inline-flex; align-items:center; justify-content:center; font-size:11px; font-weight:700; flex-shrink:0;">${i + 1}</span>
              <strong style="font-size:14px;">${g.activity.name}</strong>
            </div>
            <div style="font-size:12px; color:#6B7280;">📍 ${g.activity.location}</div>
            <div style="font-size:12px; color:#6B7280; margin-top:3px;">📅 ${actDate}</div>
            <div style="font-size:12px; color:#6B7280;">🕐 ${startT} – ${endT}</div>
            ${g.activity.notes ? `<div style="font-size:11px; color:#9CA3AF; margin-top:5px; border-top:1px solid #F3F4F6; padding-top:5px;">${g.activity.notes}</div>` : ''}
          </div>
        `;

        const marker = L.marker([g.lat, g.lng], { icon })
          .addTo(map)
          .bindPopup(popupHtml, { offset: [0, -10] });

        marker.on('click', () => setSelectedIdx(i));
      });

      // Fit map to show all markers
      const bounds = L.latLngBounds(latlngs);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    });

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [geocoded]);

  if (locActivities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
        <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
          <MapPin size={28} className="text-zinc-400" />
        </div>
        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">ยังไม่มีสถานที่บนแผนที่</p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center max-w-xs">
          เพิ่มชื่อสถานที่ใน &quot;กิจกรรม&quot; เพื่อแสดงเส้นทางที่นี่
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Loading bar */}
      {loading && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
          <Loader2 size={18} className="text-blue-500 animate-spin shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-700 dark:text-blue-300">กำลังค้นหาพิกัด...</p>
            <div className="mt-1.5 h-1.5 bg-blue-100 dark:bg-blue-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-blue-500 mt-1">{progress}% · {locActivities.length} สถานที่</p>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Map + Timeline layout */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Leaflet Map */}
        <div className="flex-1 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-sm" style={{ minHeight: '420px' }}>
          {/* Leaflet CSS */}
          <link
            rel="stylesheet"
            href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
            integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
            crossOrigin=""
          />
          <div
            ref={mapRef}
            className="w-full h-full"
            style={{ minHeight: '420px', background: '#e8e0d8' }}
          />
        </div>

        {/* Timeline sidebar */}
        <div className="lg:w-72 shrink-0">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/60 dark:border-zinc-800 overflow-hidden">
            <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">เส้นทาง {tripName}</h3>
              <p className="text-xs text-zinc-400 mt-0.5">{locActivities.length} สถานที่</p>
            </div>
            <div className="overflow-y-auto" style={{ maxHeight: '380px' }}>
              {locActivities.map((activity, i) => {
                const geo = geocoded.find(g => g.activity.id === activity.id);
                const color = ROUTE_COLORS[i % ROUTE_COLORS.length];
                const isSelected = selectedIdx === i;
                const isFirst = i === 0;
                const isLast = i === locActivities.length - 1;

                return (
                  <div
                    key={activity.id}
                    onClick={() => {
                      setSelectedIdx(i);
                      // Pan map to this location
                      if (geo && leafletMapRef.current) {
                        leafletMapRef.current.setView([geo.lat, geo.lng], 14, { animate: true });
                      }
                    }}
                    className={`flex items-stretch gap-0 cursor-pointer transition-colors ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50'}`}
                  >
                    {/* Timeline connector */}
                    <div className="flex flex-col items-center w-12 shrink-0 py-3 pl-4">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm"
                        style={{ background: color }}
                      >
                        {i + 1}
                      </div>
                      {!isLast && (
                        <div className="flex-1 w-0.5 mt-2 rounded-full" style={{ background: `${color}40`, minHeight: '12px' }} />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 py-3 pr-4 min-w-0">
                      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate flex items-center gap-1.5">
                        {isFirst && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 font-medium shrink-0">START</span>}
                        {isLast && !isFirst && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-300 font-medium shrink-0">END</span>}
                        {activity.name}
                      </p>
                      <p className="text-[11px] text-zinc-500 flex items-center gap-1 mt-0.5 truncate">
                        <MapPin size={10} className="shrink-0" />
                        {activity.location}
                      </p>
                      <p className="text-[11px] text-zinc-400 flex items-center gap-1 mt-0.5">
                        <Calendar size={10} className="shrink-0" />
                        {format(new Date(activity.date), 'd MMM', { locale: th })}
                        <Clock size={10} className="shrink-0 ml-1" />
                        {format(new Date(activity.startTime), 'HH:mm')}
                      </p>
                      {!geo && !loading && (
                        <p className="text-[10px] text-amber-500 mt-0.5">⚠️ ไม่พบพิกัด</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Attribution */}
      <p className="text-[10px] text-zinc-400 text-right">
        Map data © OpenStreetMap contributors | Geocoding by Nominatim
      </p>
    </div>
  );
}
