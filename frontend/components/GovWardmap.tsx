"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
const GeoJSON = dynamic(
  () => import("react-leaflet").then((m) => m.GeoJSON),
  { ssr: false }
);


/* ================= LEAFLET (SSR OFF) ================= */
const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr: false }
);
const Circle = dynamic(
  () => import("react-leaflet").then((m) => m.Circle),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((m) => m.Popup),
  { ssr: false }
);

/* ================= TYPES ================= */
type WardAQI = {
  ward: string;
  pm25: number;
  risk_level: "Good" | "Moderate" | "Poor" | "Severe";
};

/* ================= WARD CENTROIDS ================= */
/* Approximate by design — intentional for demo */
const WARD_POINTS: Record<string, [number, number]> = {
  "Rohini": [28.713, 77.105],
  "Karol Bagh": [28.651, 77.189],
  "Minto Road (ITO – Civic Centre)": [28.628, 77.241],
  "Anand Vihar": [28.648, 77.315],
  "Dwarka": [28.592, 77.045],
  "Lajpat Nagar": [28.567, 77.243],
};

/* ================= VISUAL RULES ================= */
const RISK_COLOR: Record<WardAQI["risk_level"], string> = {
  Good: "#22c55e",
  Moderate: "#eab308",
  Poor: "#f97316",
  Severe: "#dc2626",
};



const radiusFromPM25 = (pm25: number) => {
  // meters
  return Math.min(3500, Math.max(600, pm25 * 35));
};

/* ================= COMPONENT ================= */
export default function GovWardMarkers() {
  const [wards, setWards] = useState<WardAQI[]>([]);
  const [showHighRiskOnly, setShowHighRiskOnly] = useState(false);

  const [boundary, setBoundary] = useState<any>(null);

useEffect(() => {
  fetch("/data/delhi-boundary.geojson")
    .then((res) => res.json())
    .then(setBoundary)
    .catch(console.error);
}, []);

  /* ================= FETCH AQI DATA ================= */
  useEffect(() => {
    fetch("http://localhost:5000/api/wards")
      .then((res) => res.json())
      .then(setWards)
      .catch(console.error);
  }, []);

  return (
    <div>
      {/* TOGGLE */}
      <label className="block mb-3 text-sm">
        <input
          type="checkbox"
          checked={showHighRiskOnly}
          onChange={(e) => setShowHighRiskOnly(e.target.checked)}
        />{" "}
        Show only high-risk wards
      </label>

      {/* MAP */}
      <div style={{ height: "500px", position: "relative" }}>
        <MapContainer
          center={[28.6139, 77.209]}
          zoom={10}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution="© OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* DELHI CITY BOUNDARY (CONTEXT ONLY) */}
{boundary && (
  <GeoJSON
    data={boundary}
    style={{
      color: "#2563eb",       // soft blue border
      weight: 2,
      fillOpacity: 0.05,      // very light fill
    }}
    interactive={false}      // 🚫 NOT clickable
  />
)}


          {/* ================= SEVERITY RINGS ================= */}
          {wards.map((w) => {
            const coords = WARD_POINTS[w.ward];
            if (!coords) return null;

            if (
              showHighRiskOnly &&
              w.risk_level !== "Poor" &&
              w.risk_level !== "Severe"
            ) {
              return null;
            }

            return (
              <Circle
                key={w.ward}
                center={coords}
                radius={radiusFromPM25(w.pm25)}
                pathOptions={{
                  color: RISK_COLOR[w.risk_level],
                  fillColor: RISK_COLOR[w.risk_level],
                  fillOpacity: 0.35,
                }}
                eventHandlers={{
                  click: () => {
                    window.location.href = `/government/ward/${encodeURIComponent(
                      w.ward
                    )}`;
                  },
                }}
              >
                <Popup>
                  <strong>{w.ward}</strong>
                  <br />
                  PM2.5: {w.pm25}
                  <br />
                  Risk: {w.risk_level}
                </Popup>
              </Circle>
            );
          })}
        </MapContainer>

        {/* LEGEND */}
        <div
          style={{
            position: "absolute",
            bottom: 20,
            left: 20,
            background: "white",
            padding: 10,
            borderRadius: 6,
            boxShadow: "0 0 10px rgba(0,0,0,0.3)",
            fontSize: 14,
          }}
        >
          <strong>Air Quality Severity</strong>
          <div>🟢 Good</div>
          <div>🟡 Moderate</div>
          <div>🟠 Poor</div>
          <div>🔴 Severe</div>
          <div className="text-xs mt-1">
            Ring size ∝ PM2.5 concentration
          </div>
        </div>
      </div>
    </div>
  );
}
