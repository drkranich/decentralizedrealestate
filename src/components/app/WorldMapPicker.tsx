import { useMemo, useRef, useState } from "react";
import { MapPin, LocateFixed } from "lucide-react";
import { toast } from "sonner";

// Coarse continent approximations as ellipses in (lat, lng) space — enough
// to render a recognizable, stylized dot-matrix world map without shipping
// a real coastline dataset or an external map library/tile dependency.
const CONTINENTS = [
  { lat: 48, lng: -100, latR: 24, lngR: 32 }, // North America
  { lat: -15, lng: -60, latR: 30, lngR: 18 }, // South America
  { lat: 50, lng: 15, latR: 14, lngR: 18 }, // Europe
  { lat: 5, lng: 20, latR: 35, lngR: 24 }, // Africa
  { lat: 48, lng: 90, latR: 32, lngR: 55 }, // Asia
  { lat: -25, lng: 135, latR: 15, lngR: 18 }, // Australia
  { lat: 72, lng: -42, latR: 9, lngR: 11 }, // Greenland
];

function isLand(lat: number, lng: number) {
  return CONTINENTS.some((c) => ((lat - c.lat) / c.latR) ** 2 + ((lng - c.lng) / c.lngR) ** 2 <= 1);
}

const COLS = 72;
const ROWS = 36;
const VB_W = 720;
const VB_H = 360;

function latLngToXY(lat: number, lng: number) {
  return {
    x: ((lng + 180) / 360) * VB_W,
    y: ((90 - lat) / 180) * VB_H,
  };
}

function xyToLatLng(x: number, y: number) {
  return {
    lng: (x / VB_W) * 360 - 180,
    lat: 90 - (y / VB_H) * 180,
  };
}

export function WorldMapPicker({
  latitude,
  longitude,
  onChange,
}: {
  latitude: number | null;
  longitude: number | null;
  onChange: (lat: number, lng: number) => void;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [locating, setLocating] = useState(false);

  const dots = useMemo(() => {
    const points: { x: number; y: number; land: boolean }[] = [];
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const lng = (col / COLS) * 360 - 180 + 360 / COLS / 2;
        const lat = 90 - (row / ROWS) * 180 - 180 / ROWS / 2;
        points.push({
          x: (col / COLS) * VB_W + VB_W / COLS / 2,
          y: (row / ROWS) * VB_H + VB_H / ROWS / 2,
          land: isLand(lat, lng),
        });
      }
    }
    return points;
  }, []);

  const marker = latitude != null && longitude != null ? latLngToXY(latitude, longitude) : null;

  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * VB_W;
    const y = ((e.clientY - rect.top) / rect.height) * VB_H;
    const { lat, lng } = xyToLatLng(x, y);
    onChange(Math.round(lat * 1000) / 1000, Math.round(lng * 1000) / 1000);
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocalização não é suportada neste navegador.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        onChange(Math.round(pos.coords.latitude * 1000) / 1000, Math.round(pos.coords.longitude * 1000) / 1000);
        toast.success("Localização atual capturada.");
      },
      (err) => {
        setLocating(false);
        toast.error(err.message || "Não foi possível obter sua localização.");
      },
      { enableHighAccuracy: false, timeout: 10000 }
    );
  };

  return (
    <div>
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          onClick={handleClick}
          className="w-full cursor-crosshair"
          style={{ aspectRatio: "2 / 1" }}
        >
          {dots.map((d, i) => (
            <circle
              key={i}
              cx={d.x}
              cy={d.y}
              r={d.land ? 2.1 : 1}
              className={d.land ? "fill-emerald/50" : "fill-white/10"}
            />
          ))}
          {marker && (
            <g>
              <circle cx={marker.x} cy={marker.y} r={9} className="fill-emerald/25" />
              <circle cx={marker.x} cy={marker.y} r={4} className="fill-emerald stroke-white" strokeWidth={1.5} />
            </g>
          )}
        </svg>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          {latitude != null && longitude != null
            ? `${latitude.toFixed(3)}, ${longitude.toFixed(3)}`
            : "Clique no mapa para definir sua localização"}
        </div>
        <button
          onClick={useMyLocation}
          disabled={locating}
          className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium backdrop-blur-sm hover:bg-white/[0.06] disabled:opacity-50"
        >
          <LocateFixed className="h-3.5 w-3.5" />
          {locating ? "Localizando…" : "Usar minha localização atual"}
        </button>
      </div>
    </div>
  );
}
