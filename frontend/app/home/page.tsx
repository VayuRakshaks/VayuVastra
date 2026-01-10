"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Navbar from "../../components/Navbar";

const LiveMap = dynamic(() => import("../../components/LiveMap"), {
  ssr: false,
});

type AQIResponse = {
  station: string;
  pm25: number;
  risk_level: "Good" | "Moderate" | "Poor" | "Severe";
  precaution: string;
  data_source: string;
};

export default function Home() {
  const [ward, setWard] = useState("Rohini");
  const [city, setCity] = useState("Delhi");
  const [data, setData] = useState<AQIResponse | null>(null);
  const [showEmergency, setShowEmergency] = useState(false);

  const [position, setPosition] = useState<[number, number]>([
    28.6139, 77.209,
  ]);

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

  const fetchAQI = async () => {
    const res = await fetch(
      `http://127.0.0.1:5000/api/aqi/${city}/${encodeURIComponent(ward)}`
    );
    if (!res.ok) return;
    setData(await res.json());
  };

  useEffect(() => {
    fetchAQI();
  }, [ward, city]);

  useEffect(() => {
    if (data && (data.risk_level === "Poor" || data.risk_level === "Severe")) {
      setShowEmergency(true);
    } else {
      setShowEmergency(false);
    }
  }, [data]);

  const handleMyLocation = () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      setPosition([pos.coords.latitude, pos.coords.longitude]);
      setWard("Minto Road (ITO – Civic Centre)");
    });
  };

  const theme = data ? AQI_THEME[data.risk_level] : null;

  return (
    <>
      <Navbar onMyLocation={handleMyLocation} />

      <main
        className="min-h-screen bg-white px-6 pb-12 text-gray-900 font-sans"
        style={{ paddingTop: "var(--navbar-height)" }}
      >
        {/* MAP */}
        <section className="h-[420px] rounded-3xl overflow-hidden shadow-xl border mb-10 bg-white">
          <LiveMap position={position} />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-[3fr_1.4fr] gap-8 max-w-7xl mx-auto">
          {/* LEFT */}
          <div className="space-y-6">
            {data && theme && (
              <div
                className="rounded-2xl p-8 shadow border"
                style={{ background: theme.bg, color: theme.text }}
              >
                <h1 className="text-6xl font-extrabold tracking-tight">
                  {data.pm25}
                  <span className="text-xl font-medium ml-2">µg/m³</span>
                </h1>

                <span className="inline-block mt-4 px-4 py-1 rounded-full bg-white text-gray-900 font-semibold text-sm">
                  {data.risk_level}
                </span>

                <div className="mt-6 text-lg space-y-1">
                  <p>
                    <b>Area:</b> {ward}, {city}
                  </p>
                  <p>
                    <b>Station:</b> {data.station}
                  </p>
                  <p>
                    <b>Source:</b> {data.data_source}
                  </p>
                </div>

                <p className="mt-4 text-base leading-relaxed">
                  {data.precaution}
                </p>
              </div>
            )}

            {data && (
              <div className="bg-white rounded-xl p-6 shadow border">
                <h3 className="text-xl font-semibold mb-2">
                  Recommended Actions
                </h3>
                <ul className="list-disc pl-5 text-base">
                  {getPrecautions(data.risk_level).map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="bg-white rounded-xl p-6 shadow border">
              <h3 className="text-xl font-semibold mb-4">
                Select City & Area
              </h3>

              <label className="text-sm font-medium text-gray-700">
                City
              </label>
              <select
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  setWard(CITY_WARDS[e.target.value][0]);
                }}
                className="w-full mt-1 mb-4 p-2 border rounded text-gray-900"
              >
                {Object.keys(CITY_WARDS).map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>

              <label className="text-sm font-medium text-gray-700">
                Area / Ward
              </label>
              <select
                value={ward}
                onChange={(e) => setWard(e.target.value)}
                className="w-full mt-1 p-2 border rounded text-gray-900"
              >
                {CITY_WARDS[city].map((w) => (
                  <option key={w}>{w}</option>
                ))}
              </select>
            </div>
          </div>

          {/* RIGHT */}
          <div className="bg-white rounded-2xl p-6 shadow border space-y-4">
            <img src="/growth.gif" className="rounded-xl" />
            <div className="bg-gray-50 rounded-xl p-4 text-base">
              🌳 <b>Trees reduce PM2.5</b>
              <br />
              Urban trees can cut pollution by 30%.
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
