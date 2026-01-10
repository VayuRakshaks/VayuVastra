"use client";

import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";

// Dynamically import Leaflet components (SSR disabled)
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const GeoJSON = dynamic(
  () => import("react-leaflet").then((mod) => mod.GeoJSON),
  { ssr: false }
);

type WardAQI = {
  ward: string;
  pm25: number;
  risk_level: string;
};

export default function GovWardMap() {
  const [geoData, setGeoData] = useState<any>(null);
  const [aqiData, setAqiData] = useState<WardAQI[]>([]);
  const [showHighRiskOnly, setShowHighRiskOnly] = useState(false);

  // Fetch GeoJSON
  useEffect(() => {
    fetch("http://localhost:5000/api/wards/geojson")
      .then((res) => res.json())
      .then((data) => setGeoData(data));
  }, []);

  // Fetch AQI data
  useEffect(() => {
    fetch("http://localhost:5000/api/wards")
      .then((res) => res.json())
      .then((data) => setAqiData(data));
  }, []);

  const getColor = (pm25: number) => {
    if (pm25 <= 30) return "green";
    if (pm25 <= 60) return "yellow";
    if (pm25 <= 90) return "orange";
    return "red";
  };

const styleFeature = (feature: any) => {
  const wardName = feature.properties?.ward;

  const wardAQI = aqiData.find(
    (w) => w.ward.toLowerCase() === wardName?.toLowerCase()
  );

  // 🔴 TOGGLE ON: show ONLY Poor & Severe
  if (showHighRiskOnly) {
    if (!wardAQI) {
      // no AQI data → hide
      return { fillOpacity: 0, weight: 0 };
    }

    if (wardAQI.risk_level !== "Poor" && wardAQI.risk_level !== "Severe") {
      // Good / Moderate → hide
      return { fillOpacity: 0, weight: 0 };
    }
  }

  const pm25 = wardAQI?.pm25 ?? 0;

  return {
    fillColor: getColor(pm25),
    color: "black",
    weight: 1,
    fillOpacity: 0.6,
  };
};


  const onEachFeature = (feature: any, layer: any) => {
    const wardName = feature.properties?.ward;

    const wardAQI = aqiData.find(
      (w) => w.ward.toLowerCase() === wardName?.toLowerCase()
    );

    if (wardAQI) {
      layer.bindTooltip(
        `<strong>${wardAQI.ward}</strong><br/>
         PM2.5: ${wardAQI.pm25}<br/>
         Risk: ${wardAQI.risk_level}<br/>
         <em>Click for details</em>`,
        { sticky: true }
      );

      layer.on("click", () => {
        window.location.href = `/government/ward/${encodeURIComponent(
          wardAQI.ward
        )}`;
      });
    }
  };

  return (
    <div style={{ marginTop: "20px" }}>
      {/* ✅ TOGGLE */}
      <label style={{ display: "block", marginBottom: "10px" }}>
        <input
          type="checkbox"
          checked={showHighRiskOnly}
          onChange={(e) => setShowHighRiskOnly(e.target.checked)}
        />{" "}
        Show only high-risk wards
      </label>

      {/* ✅ MAP */}
      <div style={{ height: "500px", position: "relative" }}>
        <MapContainer
          center={[28.6139, 77.209]}
          zoom={10}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution="© OpenStreetMap"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {geoData && (
            <GeoJSON
              data={geoData}
              style={styleFeature}
              onEachFeature={onEachFeature}
            />
          )}
        </MapContainer>

        {/* ✅ LEGEND */}
        <div
          style={{
            position: "absolute",
            bottom: "20px",
            left: "20px",
            background: "white",
            padding: "10px",
            borderRadius: "6px",
            boxShadow: "0 0 10px rgba(0,0,0,0.3)",
            fontSize: "14px",
          }}
        >
          <strong>AQI Legend</strong>
          <div>🟩 Good (≤30)</div>
          <div>🟨 Moderate (31–60)</div>
          <div>🟧 Poor (61–90)</div>
          <div>🟥 Severe (&gt;90)</div>
        </div>
      </div>
    </div>
  );
}
