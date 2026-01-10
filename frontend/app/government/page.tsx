"use client";

import { useEffect, useState } from "react";
import GovWardMap from "@/components/GovWardmap";
import Navbar from "@/components/Navbar";
import GovAuthGuard from "@/components/GovAuthGuard";


type WardData = {
  ward: string;
  station: string;
  pm25: number;
  risk_level: "Good" | "Moderate" | "Poor" | "Severe";
};

/* AQI THEME (same system as public dashboard) */
const AQI_THEME = {
  Good: { bg: "#E6F4EA", text: "#14532d" },
  Moderate: { bg: "#FFF3CD", text: "#78350f" },
  Poor: { bg: "#FFE5D0", text: "#9a3412" },
  Severe: { bg: "#F8D7DA", text: "#7f1d1d" },
};

export default function GovernmentDashboard() {
  const [allWards, setAllWards] = useState<WardData[]>([]);
  const [highRiskWards, setHighRiskWards] = useState<WardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("http://localhost:5000/api/wards").then((res) => res.json()),
      fetch("http://localhost:5000/api/wards/high-risk").then((res) =>
        res.json()
      ),
    ])
      .then(([all, highRisk]) => {
        setAllWards(all);
        setHighRiskWards(highRisk);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <>
        <GovAuthGuard>
    <Navbar />
    <main>...</main>
  </GovAuthGuard>

      <main
        className="min-h-screen bg-white px-6 pb-12 text-gray-900 font-sans"
        style={{ paddingTop: "var(--navbar-height)" }}
      >
        <div className="max-w-7xl mx-auto">
          {/* HEADER */}
          <header className="mb-8">
            <h1 className="text-4xl font-extrabold tracking-tight">
              Government Air Quality Dashboard
            </h1>
            <p className="text-gray-600 mt-2 text-lg">
              Ward-wise PM2.5 monitoring & risk assessment
            </p>
          </header>

          {loading && (
            <p className="mt-6 text-gray-600 text-lg">
              Loading ward data…
            </p>
          )}

          {!loading && (
            <>
              {/* SUMMARY CARDS */}
              <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                <div className="bg-white border rounded-2xl shadow p-6">
                  <p className="text-sm text-gray-600">Total Wards</p>
                  <p className="text-4xl font-bold mt-1">
                    {allWards.length}
                  </p>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-2xl shadow p-6">
                  <p className="text-sm text-red-700">
                    High Risk Wards
                  </p>
                  <p className="text-4xl font-bold text-red-800 mt-1">
                    {highRiskWards.length}
                  </p>
                </div>
              </section>

              {/* LISTS */}
              <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* ALL WARDS */}
                <div className="bg-white border rounded-2xl shadow p-6">
                  <h2 className="text-xl font-semibold mb-4">
                    All Wards
                  </h2>

                  <ul className="divide-y">
                    {allWards.map((w) => {
                      const theme = AQI_THEME[w.risk_level];
                      return (
                        <li key={w.ward}>
                          <a
                            href={`/government/ward/${encodeURIComponent(
                              w.ward
                            )}`}
                            className="flex justify-between items-center py-3 px-2 rounded hover:bg-gray-50 transition"
                          >
                            <span className="font-medium">
                              {w.ward}
                            </span>

                            <span
                              className="text-sm font-semibold px-3 py-1 rounded-full"
                              style={{
                                background: theme.bg,
                                color: theme.text,
                              }}
                            >
                              {w.pm25} — {w.risk_level}
                            </span>
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {/* HIGH RISK WARDS */}
                <div className="bg-white border rounded-2xl shadow p-6">
                  <h2 className="text-xl font-semibold text-red-700 mb-4">
                    ⚠ High Risk Wards
                  </h2>

                  <ul className="divide-y">
                    {highRiskWards.map((w) => {
                      const theme = AQI_THEME[w.risk_level];
                      return (
                        <li key={w.ward}>
                          <a
                            href={`/government/ward/${encodeURIComponent(
                              w.ward
                            )}`}
                            className="flex justify-between items-center py-3 px-2 rounded hover:bg-red-50 transition"
                          >
                            <span className="font-medium">
                              {w.ward}
                            </span>

                            <span
                              className="text-sm font-semibold px-3 py-1 rounded-full"
                              style={{
                                background: theme.bg,
                                color: theme.text,
                              }}
                            >
                              {w.pm25} — {w.risk_level}
                            </span>
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </section>

              {/* MAP */}
              <section className="mt-14 bg-white border rounded-2xl shadow p-6">
                <h2 className="text-xl font-semibold mb-4">
                  Ward Heatmap
                </h2>
                <GovWardMap />
              </section>
            </>
          )}
        </div>
      </main>
    </>
  );
}
