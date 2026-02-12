import { useEffect, useState } from 'react';
import { Loader2, MapPin } from 'lucide-react';

export default function HoverMap({ location }: { location: string }) {
  const [coords, setCoords] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function fetchCoords() {
      try {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`;
        const res = await fetch(url, {
          headers: { 'Accept-Language': 'th,en', 'User-Agent': 'RouteBuddy/1.0' },
        });
        const data = await res.json();
        if (data && data.length > 0 && active) {
          setCoords([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
        }
      } catch (e) {
        console.error("Geocoding failed", e);
      } finally {
        if (active) setLoading(false);
      }
    }
    fetchCoords();
    return () => { active = false; };
  }, [location]);

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400 bg-zinc-50 dark:bg-zinc-800">
        <Loader2 size={24} className="animate-spin mb-2 text-blue-500" />
        <span className="text-xs">กำลังค้นหาพิกัด...</span>
      </div>
    );
  }

  if (!coords) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400 bg-zinc-50 dark:bg-zinc-800">
        <MapPin size={24} className="mb-2 opacity-50" />
        <span className="text-xs">ไม่พบระบุตำแหน่งในแผนที่</span>
      </div>
    );
  }

  const [lat, lon] = coords;
  // Create a small bounding box around the coordinates for the iframe
  const d = 0.005;
  const bbox = `${lon - d},${lat - d},${lon + d},${lat + d}`;

  return (
    <iframe
      width="100%"
      height="100%"
      style={{ border: 0 }}
      src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lon}`}
      title={`Map of ${location}`}
    />
  );
}
