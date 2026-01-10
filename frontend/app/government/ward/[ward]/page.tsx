"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import GovAuthGuard from "@/components/GovAuthGuard";


/* ================= TYPES ================= */
type WardAQI = {
  city: string;
  station: string;
  pm25: number;
  risk_level: "Good" | "Moderate" | "Poor" | "Severe";
  precaution: string;
  data_source: string;
};

/* AQI COLORS (same theme as dashboards) */
const riskColors: Record<WardAQI["risk_level"], string> = {
  Good: "#14532d",
  Moderate: "#78350f",
  Poor: "#9a3412",
  Severe: "#7f1d1d",
};

export default function WardDetailPage() {
  /* ================= PARAMS ================= */
  const params = useParams();
  const rawWard = params?.ward as string | undefined;
  const ward = rawWard ? decodeURIComponent(rawWard) : null;

  /* ================= STATE ================= */
  const [data, setData] = useState<WardAQI | null>(null);
  const [loading, setLoading] = useState(true);

  /* Prevent double fetch in React Strict Mode */
  const fetchedRef = useRef(false);

  /* ================= FETCH ================= */
  useEffect(() => {
    if (!ward || fetchedRef.current) return;

    fetchedRef.current = true;

    fetch(
      `http://localhost:5000/api/aqi/Delhi/${encodeURIComponent(ward)}`
    )
      .then((res) => res.json())
      .then((result) => {
        setData(result);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [ward]);

  /* ================= UI ================= */
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
        {/* LOADING STATE */}
        {loading && (
          <p className="max-w-4xl mx-auto mt-10 text-lg text-gray-600">
            Loading ward data…
          </p>
        )}

        {/* NO DATA */}
        {!loading && !data && (
          <p className="max-w-4xl mx-auto mt-10 text-lg text-gray-600">
            No data found.
          </p>
        )}

        {/* DATA VIEW */}
        {!loading && data && ward && (
          <div className="max-w-4xl mx-auto">
            {/* HEADER */}
            <header className="mb-8">
              <h1 className="text-4xl font-extrabold tracking-tight">
                {ward}
              </h1>
              <p className="text-gray-600 text-lg">
                Ward-level air quality details
              </p>
            </header>

            {/* MAIN CARD */}
            <div className="bg-white border rounded-2xl shadow p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Info label="City" value={data.city} />
                <Info label="Station" value={data.station} />
                <Info
                  label="PM2.5"
                  value={`${data.pm25} µg/m³`}
                />

                {/* RISK BADGE */}
                <div>
                  <p className="text-sm text-gray-600">
                    Risk Level
                  </p>
                  <span
                    className="inline-block mt-2 px-4 py-1 rounded-full text-sm font-semibold"
                    style={{
                      background: "#ffffff",
                      color: riskColors[data.risk_level],
                      border: `1px solid ${riskColors[data.risk_level]}`,
                    }}
                  >
                    {data.risk_level}
                  </span>
                </div>
              </div>

              {/* PRECAUTIONS */}
              <div className="mt-6 bg-gray-50 rounded-xl p-4">
                <p className="font-semibold mb-1">
                  Recommended Precautions
                </p>
                <p>{data.precaution}</p>
              </div>

              {/* SOURCE */}
              <p className="mt-4 text-xs text-gray-600">
                Data Source: {data.data_source}
              </p>
            </div>
          </div>
        )}
      </main>
    </>
  );
}

/* ================= REUSABLE INFO ================= */
function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-sm text-gray-600">{label}</p>
      <p className="font-semibold text-gray-900">{value}</p>
    </div>
  );
}
