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
  const CITY_WARDS: Record<string, string[]> = {
  Delhi: ["Rohini", "Dwarka", "Anand Vihar", "Lajpat Nagar"],
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
    if (lat > 28.7 && lng < 77.15) return "Rohini";
    if (lat < 28.6 && lng < 77.1) return "Dwarka";
    if (lng > 77.3) return "Anand Vihar";
    return "Lajpat Nagar";
  }

  // Default fallback
  return CITY_WARDS[selectedCity][0];
};

  // ✅ CORRECT AQI FETCH (USED EVERYWHERE)
 const fetchAQI = async (selectedCity: string, selectedWard: string) => {
  setLoading(true);
  try {
    const res = await fetch(
      `http://127.0.0.1:5000/api/aqi/${selectedCity}/${selectedWard}`
    );
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


  // 📍 Triggered from Navbar
  const handleMyLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        // Update map position
        setPosition([lat, lng]);

        // Detect ward & fetch AQI
        const detectedWard = detectWardFromLocation(lat, lng, city);
        setWard(detectedWard);
        fetchAQI(city,detectedWard);

        setLocationUsed(true);
      },
      () => alert("Location permission denied")
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
      {/* 🔝 Navbar with Live Location */}
      <Navbar onMyLocation={handleMyLocation} />

      <main
        style={{
          padding: "2rem",
          background: "#F4F6F8",
          minHeight: "100vh",
          color: "#1F2937",
        }}
      >
        {/* 🗺️ LIVE MAP */}
        <section
          style={{
            height: "380px",
    borderRadius: "14px",
    overflow: "hidden",
    background: "#ffffff",
    border: "1px solid #E5E7EB",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    marginBottom: "2rem",
          }}
        >
          <LiveMap position={position} />
        </section>

        {locationUsed && (
          <p style={{ fontSize: "0.9rem", color: "#555" }}>
            Location used only to show AQI. No personal data is stored.
          </p>
        )}
<section
  style={{
    background: "#ffffff",
    padding: "1.5rem",
    borderRadius: "12px",
    marginBottom: "2rem",
    maxWidth: "520px",
  }}
>
  <h2>Select City & Area</h2>

  {/* City Selector */}
  <select
    value={city}
    onChange={(e) => {
      setCity(e.target.value);
      setWard(CITY_WARDS[e.target.value][0]); // default ward
    }}
    style={{ padding: "0.6rem", marginRight: "1rem" }}
  >
    {Object.keys(CITY_WARDS).map((cityName) => (
      <option key={cityName}>{cityName}</option>
    ))}
  </select>

  {/* Ward Selector */}
  <select
    value={ward}
    onChange={(e) => setWard(e.target.value)}
    style={{ padding: "0.6rem", marginTop: "0.8rem" }}
  >
    {CITY_WARDS[city].map((w) => (
      <option key={w}>{w}</option>
    ))}
  </select>
</section>

        {/* Ward Selector */}
        <section
          style={{
            background: "#fff",
            padding: "1.5rem",
            borderRadius: "12px",
            marginBottom: "2rem",
          }}
        >
          <h2>Select Ward</h2>
          <select
            value={ward}
            onChange={(e) => {
              const selectedWard = e.target.value;
  setWard(selectedWard);
  fetchAQI(city, selectedWard); // ✅ explicit call
            }}
            style={{ padding: "0.6rem", marginTop: "0.8rem" }}
          >
            <option>Rohini</option>
            <option>Dwarka</option>
            <option>Anand Vihar</option>
            <option>Lajpat Nagar</option>
          </select>
          
        </section>
        {/* 🎨 AQI Risk Color Legend */}
<section
  style={{
    background: "#ffffff",
    padding: "1rem 1.5rem",
    borderRadius: "12px",
    marginBottom: "1.5rem",
    maxWidth: "520px",
  }}
>
  <h3 style={{ marginBottom: "0.8rem" }}>Air Quality Risk Levels</h3>

  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem" }}>
    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
      <span
        style={{
          width: "14px",
          height: "14px",
          borderRadius: "50%",
          background: "#1E7E34",
        }}
      />
      <span><b>Good:</b> Safe for all activities</span>
    </div>

    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
      <span
        style={{
          width: "14px",
          height: "14px",
          borderRadius: "50%",
          background: "#856404",
        }}
      />
      <span><b>Moderate:</b> Minor discomfort for sensitive people</span>
    </div>

    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
      <span
        style={{
          width: "14px",
          height: "14px",
          borderRadius: "50%",
          background: "#D9480F",
        }}
      />
      <span><b>Poor:</b> Avoid prolonged outdoor exposure</span>
    </div>

    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
      <span
        style={{
          width: "14px",
          height: "14px",
          borderRadius: "50%",
          background: "#842029",
        }}
      />
      <span><b>Severe:</b> Stay indoors, health risk</span>
    </div>
  </div>
</section>


        {/* AQI CARD */}
        {loading && <p>Loading AQI…</p>}

        {data && (
          <section
            style={{
              background: "#ffffff",
    padding: "1.6rem",
    borderRadius: "14px",
    border: "1px solid #E5E7EB",
    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
    maxWidth: "440px",
    ...getRiskStyle(data.risk_level),
            }}
          >
            <h2>{ward}, Delhi</h2>
            <p><b>Station:</b> {data.station}</p>
            <p><b>PM2.5:</b> {data.pm25}  µg/m³</p>
            <p><b>Risk Level:</b> {data.risk_level}</p>
            <p><b>Precaution:</b> {data.precaution}</p>
            <p style={{ fontSize: "0.8rem", opacity: 0.6 }}>
              Source: {data.data_source}
            </p>
          </section>
        )}
        {/* 🚨 Precaution Suggestions */}
{data && (
  <section
    style={{
      marginTop: "1.2rem",
      background: "#ffffff",
      padding: "1.2rem 1.5rem",
      borderRadius: "12px",
      border: "1px solid #E5E7EB",
      maxWidth: "440px",
    }}
  >
    <div
  style={{
    height: "6px",
    width: "100%",
    borderRadius: "4px",
    marginBottom: "0.8rem",
    background:
      data.risk_level === "Good"
        ? "#1E7E34"
        : data.risk_level === "Moderate"
        ? "#856404"
        : data.risk_level === "Poor"
        ? "#D9480F"
        : "#842029",
  }}
/>

    <h3 style={{ marginBottom: "0.6rem" }}>
      Recommended Precautions for {ward}
    </h3>

    <ul style={{ paddingLeft: "1.2rem", margin: 0 }}>
      {getPrecautions(data.risk_level).map((item, index) => (
        <li key={index} style={{ marginBottom: "0.4rem" }}>
          {item}
        </li>
        
      ))}
    </ul>
  </section>
)}

      </main>
    </>
  );
}
