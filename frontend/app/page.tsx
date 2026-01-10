"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Navbar from "../components/Navbar";

// SSR-safe map import
const LiveMap = dynamic(() => import("../components/LiveMap"), {
  ssr: false,
});

type AQIResponse = {
  station: string;
  pm25: number;
  risk_level: string;
  precaution: string;
  data_source: string;
};

export default function Home() {
  const [ward, setWard] = useState("Rohini");
  const [data, setData] = useState<AQIResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [locationUsed, setLocationUsed] = useState(false);
  const [city, setCity] = useState("Delhi");
  const [showEmergency, setShowEmergency] = useState(false);

 const CITY_WARDS: Record<string, string[]> = {
  Delhi: [
    "Minto Road (ITO – Civic Centre)", // 👈 venue first (hardcoded priority)
    "Rohini",
    "Dwarka",
    "Anand Vihar",
    "Lajpat Nagar",
  ],
  Mumbai: ["Andheri", "Bandra", "Borivali", "Kurla"],
  Bengaluru: ["Whitefield", "Electronic City", "Indiranagar", "Yelahanka"],
  Chennai: ["T Nagar", "Velachery", "Anna Nagar", "Tambaram"],
};
  const getPrecautions = (risk: string): string[] => {
  switch (risk) {
    case "Good":
      return [
        "Outdoor activities are safe",
        "Maintain normal routines",
      ];
    case "Moderate":
      return [
        "Sensitive people should limit outdoor exposure",
        "Avoid heavy outdoor exercise",
      ];
    case "Poor":
      return [
        "Limit outdoor activities",
        "Wear masks when going outside",
        "Children & elderly should stay indoors",
      ];
    case "Severe":
      return [
        "Avoid going outdoors",
        "Use N95 masks if stepping out",
        "Keep windows closed",
      ];
    default:
      return [];
  }
};



  // Default Delhi center
  const [position, setPosition] = useState<[number, number]>([
    28.6139, 77.2090,
  ]);

  // 🔹 MOCK lat/lng → ward mapping
const detectWardFromLocation = (
  lat: number,
  lng: number,
  selectedCity: string
): string => {
  if (selectedCity === "Delhi") {
    // 🏛️ Venue priority (MCD Civic Centre – ITO)
    if (lat > 28.62 && lat < 28.64 && lng > 77.23 && lng < 77.26) {
      return "Minto Road (ITO – Civic Centre)";
    }

    if (lat > 28.7 && lng < 77.15) return "Rohini";
    if (lat < 28.6 && lng < 77.1) return "Dwarka";
    if (lng > 77.3) return "Anand Vihar";

    return "Minto Road (ITO Civic Centre)";
  }

  return CITY_WARDS[selectedCity][0];
};


  // ✅ CORRECT AQI FETCH (USED EVERYWHERE)
const fetchAQI = async (selectedCity: string, selectedWard: string) => {
  if (!selectedCity || !selectedWard) return; // 🛡️ guard

  setLoading(true);
  try {
    const res = await fetch(
  `http://127.0.0.1:5000/api/aqi/${selectedCity}/${encodeURIComponent(selectedWard)}`
)


    if (!res.ok) {
  console.warn("AQI data not available for", selectedCity, selectedWard);
  setData(null);
  return;
}


    const json = await res.json();
    setData(json);
  } catch (err) {
    console.error("Failed to fetch AQI", err);
  } finally {
    setLoading(false);
  }
};



  // 🔁 Fetch AQI whenever ward changes
  useEffect(() => {
  fetchAQI(city,ward);
}, [ward,city]);

useEffect(() => {
  if (data && (data.risk_level === "Poor" || data.risk_level === "Severe")) {
    setShowEmergency(true);
  } else {
    setShowEmergency(false);
  }
}, [data]);

  // 📍 Triggered from Navbar
const handleMyLocation = () => {
  if (!navigator.geolocation) {
    alert("Geolocation not supported");
    return;
  }

  setLoading(true);

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      setPosition([lat, lng]);

      const detectedWard = detectWardFromLocation(lat, lng, city);
      setWard(detectedWard); // 👈 let useEffect handle fetch

      setLocationUsed(true);
    },
    () => {
      alert("Location permission denied");
      setLoading(false);
    }
  );
};


  // 🎨 Risk-based UI styles
  const getRiskStyle = (risk: string) => {
    switch (risk) {
      case "Good":
        return { background: "#E6F4EA", color: "#1E7E34" };
      case "Moderate":
        return { background: "#FFF3CD", color: "#856404" };
      case "Poor":
        return { background: "#FFE5D0", color: "#D9480F" };
      case "Severe":
        return { background: "#F8D7DA", color: "#842029" };
      default:
        return {};
    }
  };
  return (
  <>
    {/* 🔝 Navbar */}
    <Navbar onMyLocation={handleMyLocation} />

    <main
      className="animated-bg"
      style={{
        padding: "2rem",
        minHeight: "100vh",
        color: "#1F2937",
      }}
    >
      {/* 🗺️ MAP */}
      <section
        style={{
          height: "420px",
          borderRadius: "16px",
          overflow: "hidden",
          background: "#ffffff",
          border: "1px solid #E5E7EB",
          boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
          marginBottom: "2rem",
        }}
      >
        <LiveMap position={position} />
      </section>
      {locationUsed && (
        <p style={{ fontSize: "0.85rem", color: "#6B7280", marginBottom: "1.5rem" }}>
          Location is used only to fetch air quality insights. No personal data is stored.
        </p>
      )}
      {/* 🧭 MAIN GRID */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "3fr 1.4fr",
          gap: "1.6rem",
          alignItems: "stretch",
        }}
      >
        
        {/* ================= LEFT DASHBOARD ================= */}
        <div>
          {/* 🌫️ AQI SUMMARY */}
          {data && (
            <div
              style={{
                background: "#ffffff",
                padding: "2rem",
                borderRadius: "16px",
                border: "1px solid #E5E7EB",
                boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
                marginBottom: "1.6rem",
                ...getRiskStyle(data.risk_level),
              }}
            >
              <h1 style={{ fontSize: "2.4rem", marginBottom: "0.2rem" }}>
                {data.pm25} <span style={{ fontSize: "1rem" }}>µg/m³</span>
              </h1>

              <span
                style={{
                  display: "inline-block",
                  padding: "0.3rem 0.9rem",
                  borderRadius: "999px",
                  fontWeight: 600,
                  background: "#ffffff",
                  color: "#111827",
                  marginBottom: "1rem",
                }}
              >
                {data.risk_level}
              </span>

              <p><b>Area:</b> {ward}, {city}</p>
              <p><b>Station:</b> {data.station}</p>
              <p><b>Source:</b> {data.data_source}</p>

              <p style={{ marginTop: "0.8rem", fontSize: "0.95rem" }}>
                {data.precaution}
              </p>
            </div>
          )}
 {/* 🏙️ CITY SELECT */}
          <div
            style={{
              background: "#ffffff",
              padding: "1.6rem",
              borderRadius: "14px",
              border: "1px solid #E5E7EB",
            }}
          >
            <h3>Select City & Area</h3>

            <label style={{ fontSize: "0.85rem", color: "#6B7280" }}>City</label>
            <select
              value={city}
              onChange={(e) => {
                setCity(e.target.value);
                setWard(CITY_WARDS[e.target.value][0]);
              }}
              style={{
                width: "100%",
                padding: "0.65rem",
                marginBottom: "1rem",
                borderRadius: "8px",
              }}
            >
              {Object.keys(CITY_WARDS).map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>

            <label style={{ fontSize: "0.85rem", color: "#6B7280" }}>Area / Ward</label>
            <select
              value={ward}
              onChange={(e) => setWard(e.target.value)}
              style={{
                width: "100%",
                padding: "0.65rem",
                borderRadius: "8px",
              }}
            >
              {CITY_WARDS[city].map((w) => (
                <option key={w}>{w}</option>
              ))}
            </select>
          </div>
          {/* 🛡️ PRECAUTIONS */}
          {data && (
            <div
              style={{
                background: "#ffffff",
                padding: "1.6rem",
                borderRadius: "14px",
                border: "1px solid #E5E7EB",
                marginBottom: "1.6rem",
              }}
            >
              <h3>Recommended Actions</h3>
              <p style={{ fontSize: "0.9rem", color: "#6B7280" }}>
                For <b>{ward}</b> based on current air quality
              </p>

              <ul>
                {getPrecautions(data.risk_level).map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          )}
          {data && (data.risk_level === "Poor" || data.risk_level === "Severe") && (
  <section
    style={{
      background: "#FFF5F5",
      padding: "1.6rem",
      borderRadius: "14px",
      border: "1px solid #FCA5A5",
      maxWidth: "520px",
      marginBottom: "2rem",
    }}
  >
    <h3 style={{ marginBottom: "0.6rem", color: "#7F1D1D" }}>
      🚨 Report Local Pollution Issue
    </h3>

    <p style={{ fontSize: "0.9rem", color: "#7F1D1D", marginBottom: "1rem" }}>
      Witnessing garbage burning, fire, or excessive smoke in your area?  
      Report it to the Pollution Control Authority.
    </p>

    <form
      action="mailto:complaints@dpcc.delhi.gov.in"
      method="post"
      encType="multipart/form-data"
    >
      <textarea
        placeholder="Describe the issue (location, time, cause)..."
        required
        style={{
          width: "100%",
          padding: "0.6rem",
          borderRadius: "8px",
          border: "1px solid #FCA5A5",
          marginBottom: "0.8rem",
        }}
      />

      <input
        type="file"
        accept="image/*,video/*"
        style={{ marginBottom: "0.8rem" }}
      />

      <button
        type="submit"
        style={{
          padding: "0.6rem 1.2rem",
          background: "#B91C1C",
          color: "#ffffff",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        Submit Complaint
      </button>
    </form>

    <p style={{ fontSize: "0.75rem", marginTop: "0.6rem", color: "#7F1D1D" }}>
      Complaints are sent via email. No personal data is stored.
    </p>
  </section>
)}


         
        </div>

        {/* ================= RIGHT ECO PANEL ================= */}
<div
  style={{
    background: "#ffffff",
    borderRadius: "16px",
    border: "1px solid #E5E7EB",
    padding: "1.2rem",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  }}
>
  {/* 🌱 PLANT GROWTH GIF */}
  <div
    style={{
      borderRadius: "12px",
      overflow: "hidden",
      border: "1px solid #E5E7EB",
    }}
  >
    <img
      src="/growth.gif"
      alt="Plant growth"
      style={{
        width: "100%",
        height: "200px",
        objectFit: "cover",
      }}
    />
  </div>

  {/* 🌿 AWARENESS / TESTIMONIAL */}
  <div
    className="eco-quote"
    style={{
      background: "#ECFEF3",
      borderRadius: "12px",
      padding: "1rem",
      fontSize: "0.95rem",
      minHeight: "90px",
      display: "flex",
      alignItems: "center",
      animation: "fadeText 9s infinite",
    }}
  >
    🌳 <b>Trees reduce PM2.5</b><br />
    Urban trees can reduce air pollution by up to <b>30%</b>.
    
  </div>
 <div
  style={{
    position: "relative",
    height: "110px",
    overflow: "hidden",
  }}
>
  {/* 🌡️ Natural Cooling */}
  <div
    className="eco-card"
    style={{
      background: "#ECFEF3",
      color: "#064e3b",
      borderRadius: "12px",
      padding: "1.25rem",
      fontSize: "0.95rem",
      border: "1px solid #A7F3D0",
      position: "absolute",
      width: "100%",
      animationDelay: "0s",
    }}
  >
    <b>🌡️ Natural Cooling</b>
    <div>Shading can lower street temperatures by <b>8°C</b>.</div>
  </div>

  {/* 🔋 Energy Saver */}
  <div
    className="eco-card"
    style={{
      background: "#ECFEF3",
      color: "#064e3b",
      borderRadius: "12px",
      padding: "1.25rem",
      fontSize: "0.95rem",
      border: "1px solid #A7F3D0",
      position: "absolute",
      width: "100%",
      animationDelay: "3s",
    }}
  >
    <b>🔋 Energy Saver</b>
    <div>Trees reduce AC usage by <b>30%</b>.</div>
  </div>

  {/* 💧 Flood Defense */}
  <div
    className="eco-card"
    style={{
      background: "#ECFEF3",
      color: "#064e3b",
      borderRadius: "12px",
      padding: "1.25rem",
      fontSize: "0.95rem",
      border: "1px solid #A7F3D0",
      position: "absolute",
      width: "100%",
      animationDelay: "6s",
    }}
  >
    <b>💧 Flood Defense</b>
    <div>One tree absorbs <b>15,000L</b> rain/year.</div>
  </div>

  {/* 🔇 Noise Buffer */}
  <div
    className="eco-card"
    style={{
      background: "#ECFEF3",
      color: "#064e3b",
      borderRadius: "12px",
      padding: "1.25rem",
      fontSize: "0.95rem",
      border: "1px solid #A7F3D0",
      position: "absolute",
      width: "100%",
      animationDelay: "9s",
    }}
  >
    <b>🔇 Noise Buffer</b>
    <div>Green buffers reduce noise by <b>10 dB</b>.</div>
  </div>
</div>

  {/* 🌍 CTA */}
  <div
    style={{
      background: "#F0F9FF",
      borderRadius: "12px",
      padding: "0.9rem",
      fontSize: "0.9rem",
      color: "#065F46",
    }}
  >
    💡 <b>Did you know?</b><br />
    Planting trees & reporting pollution can significantly improve local air quality.
  </div>
  
</div>
        {showEmergency && (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      background: "rgba(0,0,0,0.4)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
    }}
  >
    <div
      style={{
        background: "#ffffff",
        padding: "2rem",
        borderRadius: "14px",
        width: "90%",
        maxWidth: "420px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
      }}
    >
      <h2 style={{ color: "#DC2626" }}>🚨 Air Quality Emergency</h2>

      <p style={{ marginTop: "0.5rem" }}>
        Air quality in <b>{ward}</b> is currently{" "}
        <b>{data?.risk_level}</b>. Prolonged exposure may cause health issues.
      </p>

      <ul style={{ marginTop: "1rem", paddingLeft: "1.2rem" }}>
        <li>📞 Emergency: <b>112</b></li>
        <li>🚑 Ambulance: <b>108</b></li>
        <li>🌫️ Pollution Helpline: <b>1800-180-1717</b></li>
        <li>🏙️ Municipal Help: <b>155303</b></li>
      </ul>

      <button
        onClick={() => setShowEmergency(false)}
        style={{
          marginTop: "1.2rem",
          padding: "0.6rem 1rem",
          background: "#DC2626",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          width: "100%",
        }}
      >
        Acknowledge & Close
      </button>
    </div>
  </div>
)}
      </section>
    </main>
  </>
);
}
