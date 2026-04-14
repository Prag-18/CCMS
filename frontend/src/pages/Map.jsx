import { useEffect, useRef, useState, useCallback } from "react";
import Layout from "../components/Layout";
import api from "../services/api";
import { handleUnauthorized } from "../utils/authError";

// ── Leaflet core (CSS imported via CDN in index.html) ──────────────────────
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// ── City-centre fallback coordinates (used when crime has no lat/lng) ──────
// We derive pseudo-coordinates from location_id so every crime shows on map.
const BASE_LAT = 28.6139;   // New Delhi as demo centre
const BASE_LNG = 77.2090;
const SPREAD    = 0.18;      // ~20 km radius

function pseudoCoords(locationId, crimeIndex) {
  // Deterministic scatter so refreshes don't jump
  const seed = (locationId * 9301 + crimeIndex * 49297) % 233280;
  const rng = seed / 233280;
  const angle = rng * 2 * Math.PI;
  const radius = Math.sqrt(rng) * SPREAD;
  return [
    BASE_LAT + radius * Math.cos(angle),
    BASE_LNG + radius * Math.sin(angle),
  ];
}

// ── Crime type → colour mapping ──────────────────────────────────────────────
const TYPE_COLORS = {
  THEFT:       "#f59e0b",
  ASSAULT:     "#ef4444",
  ROBBERY:     "#f97316",
  FRAUD:       "#8b5cf6",
  MURDER:      "#dc2626",
  VANDALISM:   "#06b6d4",
  DRUG:        "#10b981",
  BURGLARY:    "#ec4899",
};
function crimeColor(type = "") {
  const key = type.toUpperCase().split(" ")[0];
  return TYPE_COLORS[key] || "#3b82f6";
}

// ── Filters ──────────────────────────────────────────────────────────────────
const ALL = "ALL";

function extractItems(payload) {
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload)) return payload;
  return [];
}

export default function MapPage() {
  const mapRef       = useRef(null);
  const leafletRef   = useRef(null);          // L.Map instance
  const heatLayerRef = useRef(null);
  const markersRef   = useRef(L.layerGroup());

  const [crimes,       setCrimes]       = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState("");
  const [mode,         setMode]         = useState("heat");   // "heat" | "pins"
  const [filterType,   setFilterType]   = useState(ALL);
  const [selectedCrime, setSelectedCrime] = useState(null);

  // ── Fetch crimes ────────────────────────────────────────────────────────────
  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      try {
        const res = await api.get("/crimes");
        if (mounted) setCrimes(extractItems(res?.data?.data));
      } catch (err) {
        if (handleUnauthorized(err)) return;
        if (mounted) setError("Failed to load crime data.");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetch();
    return () => { mounted = false; };
  }, []);

  // ── Init Leaflet map ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || leafletRef.current) return;

    const map = L.map(mapRef.current, {
      center: [BASE_LAT, BASE_LNG],
      zoom: 12,
      zoomControl: false,
    });

    // Dark tile layer (CartoDB dark)
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      { attribution: "© OpenStreetMap © CARTO", maxZoom: 19 }
    ).addTo(map);

    L.control.zoom({ position: "bottomright" }).addTo(map);

    markersRef.current.addTo(map);
    leafletRef.current = map;

    return () => {
      map.remove();
      leafletRef.current = null;
    };
  }, []);

  // ── Filtered crimes ─────────────────────────────────────────────────────────
  const filtered = filterType === ALL
    ? crimes
    : crimes.filter((c) => (c.crime_type || "").toUpperCase() === filterType);

  const crimeTypes = [ALL, ...Array.from(new Set(crimes.map((c) => (c.crime_type || "UNKNOWN").toUpperCase())))];

  // ── Render heatmap ──────────────────────────────────────────────────────────
  const renderHeat = useCallback(() => {
    const map = leafletRef.current;
    if (!map) return;

    // Remove old heat layer if present
    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current);
      heatLayerRef.current = null;
    }
    markersRef.current.clearLayers();

    const points = filtered.map((crime, i) => {
      const [lat, lng] = pseudoCoords(crime.location_id || i + 1, i);
      return [lat, lng, 1];
    });

    if (points.length === 0) return;

    // Inline heatmap using canvas circles (no extra plugin needed)
    // We draw custom canvas overlay approach with L.CircleMarker clusters
    points.forEach(([lat, lng], i) => {
      const crime = filtered[i];
      const color = crimeColor(crime.crime_type);

      const circle = L.circleMarker([lat, lng], {
        radius: mode === "heat" ? 18 : 8,
        fillColor: color,
        color: "transparent",
        fillOpacity: mode === "heat" ? 0.22 : 0.85,
        weight: 0,
      });

      if (mode === "pins") {
        circle.setStyle({ radius: 7, fillOpacity: 0.9, color: "white", weight: 1 });
        circle.on("click", () => setSelectedCrime(crime));
        circle.bindTooltip(
          `<div style="background:#0d1526;color:#f1f5f9;border:1px solid rgba(59,130,246,0.3);border-radius:8px;padding:6px 10px;font-size:12px">
            <b>${crime.crime_type || "N/A"}</b><br/>
            ${crime.description ? crime.description.slice(0, 60) + "…" : ""}
          </div>`,
          { opacity: 1, className: "" }
        );
      }

      markersRef.current.addLayer(circle);
    });

    // For heatmap mode add a second pass with smaller, more opaque dots at epicentres
    if (mode === "heat") {
      points.forEach(([lat, lng], i) => {
        const crime = filtered[i];
        const color = crimeColor(crime.crime_type);
        const dot = L.circleMarker([lat, lng], {
          radius: 5,
          fillColor: color,
          color: "transparent",
          fillOpacity: 0.9,
          weight: 0,
        });
        dot.on("click", () => setSelectedCrime(crime));
        markersRef.current.addLayer(dot);
      });
    }
  }, [filtered, mode]);

  useEffect(() => {
    if (!loading) renderHeat();
  }, [loading, renderHeat]);

  // ── Stats ───────────────────────────────────────────────────────────────────
  const typeCounts = crimes.reduce((acc, c) => {
    const t = (c.crime_type || "UNKNOWN").toUpperCase();
    acc[t] = (acc[t] || 0) + 1;
    return acc;
  }, {});

  const topTypes = Object.entries(typeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <Layout>
      {/* Page header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            Crime Heatmap
          </h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
            Spatial distribution of reported crimes
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Type filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="rounded-xl px-3 py-2 text-sm outline-none cursor-pointer"
            style={{
              background: "var(--card-bg)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "var(--text-primary)",
            }}
          >
            {crimeTypes.map((t) => (
              <option key={t} value={t} style={{ background: "#0b1120" }}>
                {t === ALL ? "All Types" : t}
              </option>
            ))}
          </select>

          {/* Mode toggle */}
          <div className="flex rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
            {["heat", "pins"].map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className="px-4 py-2 text-sm font-medium transition-colors"
                style={{
                  background: mode === m ? "rgba(59,130,246,0.25)" : "var(--card-bg)",
                  color: mode === m ? "#60a5fa" : "var(--text-secondary)",
                  borderRight: m === "heat" ? "1px solid rgba(255,255,255,0.1)" : "none",
                }}
              >
                {m === "heat" ? "🌡 Heatmap" : "📍 Pins"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl text-sm"
          style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#fca5a5" }}>
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-5">
        {/* Map */}
        <div className="xl:col-span-3">
          <div className="glass-card overflow-hidden" style={{ height: "560px", position: "relative" }}>
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center z-10"
                style={{ background: "rgba(11,17,32,0.8)", borderRadius: "14px" }}>
                <div className="flex flex-col items-center gap-3">
                  <svg className="animate-spin" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                  </svg>
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Loading crime data...</p>
                </div>
              </div>
            )}
            <div ref={mapRef} style={{ width: "100%", height: "100%" }} />

            {/* Count badge */}
            <div className="absolute top-4 left-4 z-[500] px-3 py-1.5 rounded-xl text-xs font-semibold"
              style={{ background: "rgba(11,17,32,0.85)", border: "1px solid rgba(59,130,246,0.3)", color: "#60a5fa", backdropFilter: "blur(8px)" }}>
              {filtered.length} incidents plotted
            </div>

            {/* Legend */}
            <div className="absolute bottom-4 left-4 z-[500] rounded-xl p-3 text-xs"
              style={{ background: "rgba(11,17,32,0.85)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(8px)" }}>
              <p className="font-semibold mb-2 text-xs uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>
                Crime Type
              </p>
              {Object.entries(TYPE_COLORS).slice(0, 5).map(([type, color]) => (
                <div key={type} className="flex items-center gap-2 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
                  <span style={{ color: "var(--text-secondary)" }}>{type}</span>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: "#3b82f6" }} />
                <span style={{ color: "var(--text-secondary)" }}>OTHER</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar panel */}
        <div className="flex flex-col gap-4">
          {/* Stats */}
          <div className="glass-card p-4">
            <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
              Top Crime Types
            </h3>
            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => <div key={i} className="shimmer h-8 rounded-lg" />)}
              </div>
            ) : topTypes.length === 0 ? (
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>No data</p>
            ) : topTypes.map(([type, count]) => {
              const pct = Math.round((count / crimes.length) * 100);
              return (
                <div key={type} className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium" style={{ color: "var(--text-primary)" }}>{type}</span>
                    <span style={{ color: "var(--text-secondary)" }}>{count} ({pct}%)</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, background: crimeColor(type) }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary stats */}
          <div className="glass-card p-4">
            <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
              Overview
            </h3>
            {[
              { label: "Total Crimes", value: crimes.length },
              { label: "Filtered",     value: filtered.length },
              { label: "Types",        value: crimeTypes.length - 1 },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center py-2"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{label}</span>
                <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{value}</span>
              </div>
            ))}
          </div>

          {/* Selected crime detail */}
          {selectedCrime && (
            <div className="glass-card p-4 fade-in" style={{ border: `1px solid ${crimeColor(selectedCrime.crime_type)}40` }}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                  Crime Detail
                </h3>
                <button onClick={() => setSelectedCrime(null)} style={{ color: "var(--text-secondary)" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>

              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg mb-3"
                style={{ background: `${crimeColor(selectedCrime.crime_type)}20` }}>
                <span className="w-2 h-2 rounded-full" style={{ background: crimeColor(selectedCrime.crime_type) }} />
                <span className="text-xs font-semibold" style={{ color: crimeColor(selectedCrime.crime_type) }}>
                  {selectedCrime.crime_type || "N/A"}
                </span>
              </div>

              {[
                { label: "Description", value: selectedCrime.description },
                { label: "Location ID", value: selectedCrime.location_id },
                { label: "Reported",    value: selectedCrime.reported_at ? new Date(selectedCrime.reported_at).toLocaleString() : "N/A" },
              ].map(({ label, value }) => (
                <div key={label} className="mb-2">
                  <p className="text-xs uppercase tracking-wider mb-0.5" style={{ color: "rgba(148,163,184,0.5)" }}>{label}</p>
                  <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{value || "N/A"}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
