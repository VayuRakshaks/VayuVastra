"use client";

import { useEffect, useState } from "react";
import GovWardMap from "@/components/GovWardMap";
import Navbar from "@/components/Navbar";
import GovAuthGuard from "@/components/GovAuthGuard";

/* ---------------- TYPES ---------------- */

type Contributor = {
  label: string;
  percent: number;
};

type AQIResponse = {
  station: string;
  pm25: number;
  risk_level: "Good" | "Moderate" | "Poor" | "Severe";
  precaution: string;
  data_source: string;
  contributors?: Contributor[];
};

type WardData = {
  ward: string;
  station: string;
  pm25: number;
  risk_level: "Good" | "Moderate" | "Poor" | "Severe";
};

/* ---------------- THEME ---------------- */

const AQI_THEME = {
  Good: { bg: "#E6F4EA", text: "#14532d" },
  Moderate: { bg: "#FFF3CD", text: "#78350f" },
  Poor: { bg: "#FFE5D0", text: "#9a3412" },
  Severe: { bg: "#F8D7DA", text: "#7f1d1d" },
};

const CONTRIBUTOR_ICONS: Record<string, string> = {
  "Vehicular Emissions": "🚗",
  Industrial: "🏭",
  "Crop Burning": "🔥",
  "Construction Dust": "🏗️",
  "Biomass & Others": "🌿",
  Others: "⚙️",
};

/* ===================================================== */

export default function GovernmentDashboard() {
  // ---------------- STATE ----------------
  const [allWards, setAllWards] = useState<WardData[]>([]);
  const [highRiskWards, setHighRiskWards] = useState<WardData[]>([]);
  const [selectedWard, setSelectedWard] = useState<string | null>(null);
  const [data, setData] = useState<AQIResponse | null>(null);
  const [loading, setLoading] = useState(true);

  /* ---------------- FETCH LISTS ---------------- */
  useEffect(() => {
    Promise.all([
      fetch("http://localhost:5000/api/wards").then((r) => r.json()),
      fetch("http://localhost:5000/api/wards/high-risk").then((r) => r.json()),
    ])
      .then(([all, highRisk]) => {
        setAllWards(all);
        setHighRiskWards(highRisk);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  /* ---------------- FETCH SELECTED WARD AQI ---------------- */
  useEffect(() => {
    if (!selectedWard) return;

    fetch(
      `http://localhost:5000/api/aqi/Delhi/${encodeURIComponent(selectedWard)}`
    )
      .then((r) => r.json())
      .then((res) => setData(res))
      .catch(() => setData(null));
  }, [selectedWard]);

  /* ===================================================== */

  return (
    <GovAuthGuard>
      <Navbar />

      <main
        className="min-h-screen bg-white px-6 pb-12 text-gray-900 font-sans"
        style={{ paddingTop: "var(--navbar-height)" }}
      >
        <div className="max-w-7xl mx-auto">
          {/* HEADER */}
          <header className="mb-8">
            <h1 className="text-4xl font-extrabold">
              Government Air Quality Dashboard
            </h1>
            <p className="text-gray-600 mt-2 text-lg">
              Ward-wise PM2.5 monitoring & risk assessment
            </p>
          </header>

          {loading && <p>Loading ward data…</p>}

          {!loading && (
            <>
              {/* SUMMARY */}
              <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                <div className="bg-white border rounded-2xl shadow p-6">
                  <p className="text-sm text-gray-600">Total Wards</p>
                  <p className="text-4xl font-bold">{allWards.length}</p>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-2xl shadow p-6">
                  <p className="text-sm text-red-700">High Risk Wards</p>
                  <p className="text-4xl font-bold text-red-800">
                    {highRiskWards.length}
                  </p>
                </div>
              </section>

              {/* LISTS */}
              <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* ALL WARDS */}
                <div className="bg-white border rounded-2xl shadow p-6">
                  <h2 className="text-xl font-semibold mb-4">All Wards</h2>
                  <ul className="divide-y">
                    {allWards.map((w) => {
                      const theme = AQI_THEME[w.risk_level];
                      return (
                        <li
                          key={w.ward}
                          onClick={() => setSelectedWard(w.ward)}
                          className="cursor-pointer flex justify-between items-center py-3 px-2 hover:bg-gray-50"
                        >
                          <span>{w.ward}</span>
                          <span
                            className="text-sm font-semibold px-3 py-1 rounded-full"
                            style={{
                              background: theme.bg,
                              color: theme.text,
                            }}
                          >
                            {w.pm25} — {w.risk_level}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {/* HIGH RISK */}
                <div className="bg-white border rounded-2xl shadow p-6">
                  <h2 className="text-xl font-semibold text-red-700 mb-4">
                    ⚠ High Risk Wards
                  </h2>
                  <ul className="divide-y">
                    {highRiskWards.map((w) => {
                      const theme = AQI_THEME[w.risk_level];
                      return (
                        <li
                          key={w.ward}
                          onClick={() => setSelectedWard(w.ward)}
                          className="cursor-pointer flex justify-between items-center py-3 px-2 hover:bg-gray-50"
                        >
                          <span>{w.ward}</span>
                          <span
                            className="text-sm font-semibold px-3 py-1 rounded-full"
                            style={{
                              background: theme.bg,
                              color: theme.text,
                            }}
                          >
                            {w.pm25} — {w.risk_level}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </section>

              {/* 🏭 POLLUTION SOURCES */}
              {data?.contributors && data.contributors.length > 0 && (
                <div className="bg-white rounded-2xl p-6 shadow border mt-10">
                  <h3 className="text-lg font-semibold mb-1">
                    🏭 Pollution Sources — {selectedWard}
                  </h3>

                  <p className="text-sm text-gray-500 mb-5">
                    Estimated contribution breakdown
                  </p>

                  <div className="space-y-4">
                    {data.contributors.map((c, i) => (
                      <div key={i}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="flex items-center gap-2 text-sm font-medium">
                            {CONTRIBUTOR_ICONS[c.label] || "⚪"} {c.label}
                          </span>
                          <span className="text-sm text-gray-600">
                            {c.percent}%
                          </span>
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

              {/* COMPLAINTS */}
              <a
                href="/government/complaints"
                className="block mt-10 bg-white border rounded-xl p-6 shadow hover:shadow-lg"
              >
                <h3 className="text-lg font-semibold text-red-600">
                  🚨 Complaints Management
                </h3>
                <p className="text-sm text-gray-600">
                  View and filter ward-wise pollution complaints
                </p>
              </a>

              {/* MAP */}
              <section className="mt-14 bg-white border rounded-2xl shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Ward Heatmap</h2>
                <GovWardMap />
              </section>
            </>
          )}
        </div>
      </main>
    </GovAuthGuard>
  );
}
