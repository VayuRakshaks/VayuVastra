"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useState } from "react";

/* ================================
   Fix Leaflet Marker Icons (No any)
================================== */
type LeafletIconProto = {
  _getIconUrl?: () => string;
};

const DefaultIcon = L.Icon.Default as unknown as {
  prototype: LeafletIconProto;
};

delete DefaultIcon.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

/* ================================
   Types
================================== */
type Props = {
  position: [number, number];
};

type AQIData = {
  ward: string;
  aqi: number;
  risk_level: string;
  cause: string;
  precaution: string;
};

/* ================================
   Recenter Map Component
================================== */
function RecenterMap({ position }: Props) {
  const map = useMap();

  useEffect(() => {
    map.setView(position, map.getZoom());
  }, [position, map]);

  return null;
}

/* ================================
   Main Component
================================== */
export default function LiveMap({ position }: Props) {
  const [aqiData, setAqiData] = useState<AQIData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLiveLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;

          const res = await fetch(
            "http://127.0.0.1:5000/api/aqi/location",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ lat: latitude, lng: longitude }),
            }
          );

          if (!res.ok) {
            throw new Error("Failed to fetch AQI data");
          }

          const data: AQIData = await res.json();
          setAqiData(data);
        } catch {
          setError("Unable to fetch air quality data");
        } finally {
          setLoading(false);
        }
      },
      () => {
        setError("Location permission denied");
        setLoading(false);
      }
    );
  };

  /* ================================
     UI
  ================================== */
  return (
    <div style={{ width: "100%" }}>
      {/* <button
        onClick={handleLiveLocation}
        style={{
          padding: "8px 12px",
          marginBottom: "10px",
          background: "#1e88e5",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        📍 Use My Live Location
      </button> */}

      <MapContainer
        center={position}
        zoom={13}
        style={{ height: "400px", width: "100%" }}
      >
        <TileLayer
          attribution="© OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker position={position}>
          <Popup>Your current location</Popup>
        </Marker>

        <RecenterMap position={position} />
      </MapContainer>

      {loading && <p style={{ marginTop: "10px" }}>⏳ Fetching air quality...</p>}

      {error && (
        <p style={{ marginTop: "10px", color: "red" }}>
          ⚠️ {error}
        </p>
      )}

      {aqiData && (
        <div
          style={{
            marginTop: "12px",
            padding: "12px",
            border: "1px solid #ddd",
            borderRadius: "6px",
          }}
        >
          <h3>🌫️ Air Quality Details</h3>

          <p><b>Ward:</b> {aqiData.ward}</p>
          <p><b>AQI:</b> {aqiData.aqi}</p>

          <p
            style={{
              fontWeight: "bold",
              color:
                aqiData.risk_level === "Severe"
                  ? "red"
                  : aqiData.risk_level === "Poor"
                  ? "orange"
                  : "green",
            }}
          >
            Risk Level: {aqiData.risk_level}
          </p>

          <p><b>Cause:</b> {aqiData.cause}</p>
          <p><b>Precaution:</b> {aqiData.precaution}</p>
        </div>
      )}
    </div>
  );
}
