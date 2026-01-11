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

type Complaint = {
  id?: number;
  city: string;
  ward: string;
  message: string;
  time: string;
  status: string;
};

/* ================= RISK COLORS ================= */
const riskColors: Record<WardAQI["risk_level"], string> = {
  Good: "#14532d",
  Moderate: "#78350f",
  Poor: "#9a3412",
  Severe: "#7f1d1d",
};

const API_BASE = "http://localhost:5000";

export default function WardDetailPage() {
  /* ================= PARAMS ================= */
  const params = useParams();
  const rawWard = params?.ward as string | undefined;
  const ward = rawWard ? decodeURIComponent(rawWard) : null;

  /* ================= STATE ================= */
  const [data, setData] = useState<WardAQI | null>(null);
  const [loading, setLoading] = useState(true);

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [complaintsLoading, setComplaintsLoading] = useState(true);

  /* Prevent double AQI fetch (StrictMode) */
  const fetchedRef = useRef(false);

  /* ================= FETCH AQI ================= */
  useEffect(() => {
    if (!ward || fetchedRef.current) return;

    fetchedRef.current = true;

    fetch(`${API_BASE}/api/aqi/Delhi/${encodeURIComponent(ward)}`)
      .then((res) => res.json())
      .then((result) => {
        setData(result);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [ward]);

  /* ================= FETCH COMPLAINTS (WARD FILTERED) ================= */
  useEffect(() => {
    if (!ward) return;

    setComplaintsLoading(true);

    fetch(
      `${API_BASE}/api/complaints?ward=${encodeURIComponent(ward)}`
    )
      .then((res) => res.json())
      .then((data) => {
        setComplaints(data);
        setComplaintsLoading(false);
      })
      .catch(() => setComplaintsLoading(false));
  }, [ward]);

  /* ================= UI ================= */
  return (
    <GovAuthGuard>
      <Navbar />

      <main
        className="min-h-screen bg-white px-6 pb-12 text-gray-900 font-sans"
        style={{ paddingTop: "var(--navbar-height)" }}
      >
        {/* LOADING */}
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

        {/* DATA */}
        {!loading && data && ward && (
          <div className="max-w-4xl mx-auto space-y-8">
            {/* HEADER */}
            <header>
              <h1 className="text-4xl font-extrabold tracking-tight">
                {ward}
              </h1>
              <p className="text-gray-600 text-lg">
                Government ward-level air quality & complaints
              </p>
            </header>

            {/* AQI CARD */}
            <div className="bg-white border rounded-2xl shadow p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Info label="City" value={data.city} />
                <Info label="Station" value={data.station} />
                <Info label="PM2.5" value={`${data.pm25} µg/m³`} />

                <div>
                  <p className="text-sm text-gray-600">Risk Level</p>
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

              <div className="mt-6 bg-gray-50 rounded-xl p-4">
                <p className="font-semibold mb-1">
                  Recommended Precautions
                </p>
                <p>{data.precaution}</p>
              </div>

              <p className="mt-4 text-xs text-gray-600">
                Data Source: {data.data_source}
              </p>
            </div>

            {/* ================= COMPLAINTS SECTION ================= */}
            <div className="bg-white border rounded-2xl shadow p-6">
              <h2 className="text-2xl font-bold mb-4">
                📢 Citizen Complaints ({complaints.length})
              </h2>

              {complaintsLoading && (
                <p className="text-gray-600">Loading complaints…</p>
              )}

              {!complaintsLoading && complaints.length === 0 && (
                <p className="text-gray-500">
                  No complaints reported for this ward.
                </p>
              )}

              {!complaintsLoading && complaints.length > 0 && (
                <ul className="space-y-4">
                  {complaints.map((c, idx) => (
                    <li
                      key={idx}
                      className="bg-gray-50 border rounded-xl p-4"
                    >
                      <p className="font-medium text-gray-900">
                        {c.message}
                      </p>

                      <div className="mt-2 flex justify-between text-sm text-gray-600">
                        <span>
                          🕒 {new Date(c.time).toLocaleString()}
                        </span>
                        <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-800">
                          {c.status}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </main>
    </GovAuthGuard>
  );
}

/* ================= INFO COMPONENT ================= */
function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-gray-600">{label}</p>
      <p className="font-semibold text-gray-900">{value}</p>
    </div>
  );
}
