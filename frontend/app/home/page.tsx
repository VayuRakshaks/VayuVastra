"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Navbar from "../../components/Navbar";
import AQIChart from "../../components/AqiCharts";

const LiveMap = dynamic(() => import("../../components/LiveMap"), {
  ssr: false,
});

type Contributor = {
  label: string;
  percent: number;
};

type AQIResponse = {
  station: string;
  pm25: number;
  risk_level: "Good" | "Moderate" | "Poor" | "Severe";
  precaution: string;
  contributors?: Contributor[]; // ✅ CORRECT
  data_source: string;
};


type AQIHistoryPoint = {
  time: string;
  pm25: number;
};

export default function Home() {
  /* ---------------- STATE ---------------- */
  const [ward, setWard] = useState("Rohini");
  const [city, setCity] = useState("Delhi");
  const [data, setData] = useState<AQIResponse | null>(null);
  const [history, setHistory] = useState<AQIHistoryPoint[]>([]);
  const [showEmergency, setShowEmergency] = useState(false);

  // ✅ complaint state (FIXED LOCATION)
  const [complaintText, setComplaintText] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const [position, setPosition] = useState<[number, number]>([
    28.6139,
    77.209,
  ]);

  const submitComplaint = async () => {
  if (!complaintText.trim()) return;

  try {
    const res = await fetch("http://127.0.0.1:5000/api/complaints", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        city: city,
        ward: ward,
        message: complaintText,
      }),
    });

    if (!res.ok) {
      throw new Error("Backend error");
    }

    await res.json();

    setSubmitted(true);
    setComplaintText("");
  } catch (error) {
    console.error("Complaint submission failed:", error);
    alert("Unable to submit complaint. Please try again.");
  }
};



  /* ---------------- CONSTANTS ---------------- */
  const CITY_WARDS: Record<string, string[]> = {
    Delhi: [
      "Minto Road (ITO – Civic Centre)",
      "Rohini",
      "Dwarka",
      "Anand Vihar",
      "Lajpat Nagar",
    ],
    Mumbai: ["Andheri", "Bandra", "Borivali", "Kurla"],
    Bengaluru: ["Whitefield", "Electronic City", "Indiranagar", "Yelahanka"],
    Chennai: ["T Nagar", "Velachery", "Anna Nagar", "Tambaram"],
  };

  const AQI_THEME = {
    Good: { bg: "#E6F4EA", text: "#14532d" },
    Moderate: { bg: "#FFF3CD", text: "#78350f" },
    Poor: { bg: "#FFE5D0", text: "#9a3412" },
    Severe: { bg: "#F8D7DA", text: "#7f1d1d" },
  };

  /* ---------------- HELPERS ---------------- */
  const getPrecautions = (risk: string): string[] => {
    switch (risk) {
      case "Good":
        return ["Outdoor activities are safe", "Maintain normal routines"];
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

  /* ---------------- API CALLS ---------------- */
  const fetchAQI = async () => {
    const res = await fetch(
      `http://127.0.0.1:5000/api/aqi/${city}/${encodeURIComponent(ward)}`
    );
    if (!res.ok) return;
    setData(await res.json());
  };

 const fetchHistory = async () => {
  setHistory([]); // ✅ RESET first (VERY IMPORTANT)

  try {
    const res = await fetch(
      `http://127.0.0.1:5000/api/aqi/history/${encodeURIComponent(ward)}`
    );
    if (!res.ok) return;

    const data = await res.json();
    setHistory(data);
  } catch (err) {
    console.error("History fetch failed", err);
  }
};


  /* ---------------- EFFECTS ---------------- */
  // 🔹 Fetch AQI when city OR ward changes
useEffect(() => {
  fetchAQI();
}, [city, ward]);

// 🔹 Fetch HISTORY only when ward changes
useEffect(() => {
  fetchHistory();
}, [ward]);

  useEffect(() => {
    if (data && (data.risk_level === "Poor" || data.risk_level === "Severe")) {
      setShowEmergency(true);
    } else {
      setShowEmergency(false);
    }
  }, [data]);
  /* ---------------- HANDLERS ---------------- */
  const handleMyLocation = () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      setPosition([pos.coords.latitude, pos.coords.longitude]);
      setWard("Minto Road (ITO – Civic Centre)");
    });
  };

  const theme = data ? AQI_THEME[data.risk_level] : null;

  /* ---------------- UI ---------------- */
  return (
    <>
      <Navbar onMyLocation={handleMyLocation} />

      <main className="min-h-screen bg-white px-6 pb-12 text-gray-900 pt-20">
        {/* MAP */}
        <section className="h-105* rounded-3xl overflow-hidden shadow-xl border mb-10">
          <LiveMap position={position} />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-[3fr_1.4fr] gap-8 max-w-7xl mx-auto">
          {/* LEFT COLUMN */}
          <div className="space-y-6">
            {/* AQI CARD */}
            {data && theme && (
              <div
                className="rounded-2xl p-8 shadow border"
                style={{ background: theme.bg, color: theme.text }}
              >
                <h1 className="text-6xl font-extrabold">
                  {data.pm25}
                  <span className="text-xl ml-2">µg/m³</span>
                </h1>

                <span className="inline-block mt-4 px-4 py-1 rounded-full bg-white text-gray-900 font-semibold">
                  {data.risk_level}
                </span>

                <div className="mt-4">
                  <p><b>Area:</b> {ward}, {city}</p>
                  <p><b>Station:</b> {data.station}</p>
                  <p><b>Source:</b> {data.data_source}</p>
                </div>

                <p className="mt-3">{data.precaution}</p>
              </div>
            )}

            {/* HISTORY CARD */}
<div className="bg-white p-6 rounded-xl shadow border">
  <h3 className="text-xl font-semibold mb-4">
    PM2.5 Trend (Today)
  </h3>

  {history.length > 0 ? (
    <AQIChart data={history} />
  ) : (
    <p className="text-gray-500 text-sm">
      No historical data available for this ward.
    </p>
  )}
</div>


             {/* SELECT */}
            <div className="bg-white rounded-xl p-6 shadow border">
              <h3 className="text-xl font-semibold mb-4">
                Select City & Area
              </h3>

              <select
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  setWard(CITY_WARDS[e.target.value][0]);
                }}
                className="w-full p-2 border rounded mb-4"
              >
                {Object.keys(CITY_WARDS).map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>

              <select
                value={ward}
                onChange={(e) => setWard(e.target.value)}
                className="w-full p-2 border rounded"
              >
                {CITY_WARDS[city].map((w) => (
                  <option key={w}>{w}</option>
                ))}
              </select>
            </div>
          </div>

            {/* ACTIONS */}
            {data && (
              <div className="bg-white rounded-xl p-6 shadow border">
                <h3 className="text-xl font-semibold mb-2">
                  Recommended Actions
                </h3>
                <ul className="list-disc pl-5">
                  {getPrecautions(data.risk_level).map((p, i) => (
                    <li key={i}>{p}</li>
                  ))} 
                </ul>
              </div>
            )}

             {/* POLLUTION SOURCES */}
            {data?.contributors && (
              <div className="bg-white p-6 rounded-xl shadow border">
                <h3 className="text-xl font-semibold mb-2">
                  Pollution Sources
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Contributing factors in this area
                </p>

                <div className="space-y-4">
                  {data.contributors.map((c, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{c.label}</span>
                        <span>{c.percent}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-green-600"
                          style={{ width: `${c.percent}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 🚨 COMPLAINT CARD */}
{data && (data.risk_level === "Poor" || data.risk_level === "Severe") && (
  <div className="bg-red-50 border border-red-200 rounded-xl p-6 shadow">
    <h3 className="text-xl font-semibold text-red-700 mb-2">
      🚨 Report Local Pollution Issue
    </h3>

    <p className="text-sm text-red-700 mb-3">
      Witnessing garbage burning, fire, or excessive smoke in your area?
      Report it to authorities.
    </p>

    {!submitted ? (
      <>
        <textarea
          value={complaintText}
          onChange={(e) => setComplaintText(e.target.value)}
          placeholder="Describe the issue (location, time, cause)…"
          className="w-full p-3 border border-red-300 rounded mb-3"
          rows={4}
        />

        <button
          onClick={submitComplaint}
          className="w-full bg-red-600 text-white py-2 rounded font-semibold hover:bg-red-700"
        >
          Submit Complaint
        </button>
      </>
    ) : (
      <p className="text-green-700 font-medium">
        ✅ Complaint submitt  ed successfully (demo).
      </p>
    )}

    <p className="text-xs text-red-600 mt-2">
      No personal data is stored. This is a demo submission.
    </p>
  </div>
)}


          {/* RIGHT COLUMN */}
          <div className="bg-white rounded-2xl p-6 shadow border space-y-4">
            <img src="/growth.gif" className="rounded-xl" />
            <div className="bg-gray-50 rounded-xl p-4">
              🌳 <b>Trees reduce PM2.5</b><br />
              Urban trees can cut pollution by 30%.
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
