"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import GovAuthGuard from "@/components/GovAuthGuard";

/* ================= TYPES ================= */

type Contributor = {
  label: string;
  percent: number;
};

type WardAQI = {
  city: string;
  station: string;
  pm25: number;
  risk_level: "Good" | "Moderate" | "Poor" | "Severe";
  precaution: string;
  data_source: string;
  contributors?: Contributor[]; // ✅ FIX
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

/* ================= POLICY ENGINE ================= */

const POLICY_BY_CONTRIBUTOR: Record<
  string,
  {
    icon: string;
    title: string;
    impact: "High Impact" | "Medium Impact";
    description: string;
  }[]
> = {
  "Vehicular Emissions": [
    {
      icon: "🚌",
      title: "Promote Public Transport",
      impact: "High Impact",
      description:
        "Expand metro and bus coverage, subsidize public transit passes.",
    },
    {
      icon: "⚡",
      title: "EV Infrastructure",
      impact: "High Impact",
      description:
        "Deploy EV charging stations and incentivize electric vehicles.",
    },
  ],
  Industrial: [
    {
      icon: "🏭",
      title: "Industrial Emission Audits",
      impact: "High Impact",
      description:
        "Enforce stack emission monitoring and periodic compliance audits.",
    },
  ],
  "Construction Dust": [
    {
      icon: "🏗️",
      title: "Construction Dust Control",
      impact: "Medium Impact",
      description:
        "Mandate dust nets, water sprinkling and frequent inspections.",
    },
  ],
  "Crop Burning": [
    {
      icon: "🔥",
      title: "Crop Residue Management",
      impact: "High Impact",
      description:
        "Incentivize non-burning disposal and bio-decomposer usage.",
    },
  ],
  "Biomass & Others": [
    {
      icon: "🌳",
      title: "Urban Greening Initiative",
      impact: "Medium Impact",
      description:
        "Expand green buffers and promote clean household fuels.",
    },
  ],
};

const API_BASE = "http://localhost:5000";

/* ===================================================== */

export default function WardDetailPage() {
  const params = useParams();
  const rawWard = params?.ward as string | undefined;
  const ward = rawWard ? decodeURIComponent(rawWard) : null;

  const [data, setData] = useState<WardAQI | null>(null);
  const [loading, setLoading] = useState(true);

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [complaintsLoading, setComplaintsLoading] = useState(true);

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

  /* ================= FETCH COMPLAINTS ================= */

  useEffect(() => {
    if (!ward) return;

    setComplaintsLoading(true);

    fetch(`${API_BASE}/api/complaints?ward=${encodeURIComponent(ward)}`)
      .then((res) => res.json())
      .then((data) => {
        setComplaints(data);
        setComplaintsLoading(false);
      })
      .catch(() => setComplaintsLoading(false));
  }, [ward]);

  /* ================= DERIVE POLICIES ================= */

  const policies =
    data?.contributors
      ?.flatMap((c) => POLICY_BY_CONTRIBUTOR[c.label] || [])
      .slice(0, 5) || [];

  /* ================= UI ================= */

  return (
    <GovAuthGuard>
      <Navbar />

      <main
        className="min-h-screen bg-white px-6 pb-12 text-gray-900"
        style={{ paddingTop: "var(--navbar-height)" }}
      >
        {!loading && data && ward && (
          <div className="max-w-4xl mx-auto space-y-8">
            {/* HEADER */}
            <header>
              <h1 className="text-4xl font-extrabold">{ward}</h1>
              <p className="text-gray-600">
                Government ward-level air quality & complaints
              </p>
            </header>

            {/* AQI CARD */}
            <div className="bg-white border rounded-2xl shadow p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <Info label="City" value={data.city} />
                <Info label="Station" value={data.station} />
                <Info label="PM2.5" value={`${data.pm25} µg/m³`} />
                <div>
                  <p className="text-sm text-gray-600">Risk Level</p>
                  <span
                    className="inline-block mt-2 px-4 py-1 rounded-full text-sm font-semibold"
                    style={{
                      border: `1px solid ${riskColors[data.risk_level]}`,
                      color: riskColors[data.risk_level],
                    }}
                  >
                    {data.risk_level}
                  </span>
                </div>
              </div>

              <div className="mt-6 bg-gray-50 rounded-xl p-4">
                <b>Recommended Precautions</b>
                <p>{data.precaution}</p>
              </div>
            </div>

            {/* 🏛 POLICY RECOMMENDATIONS */}
            {policies.length > 0 && (
              <div className="bg-white border rounded-2xl shadow p-6">
                <h2 className="text-2xl font-bold mb-4">
                  💡 Policy Recommendations
                </h2>

                <div className="space-y-4">
                  {policies.map((p, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center bg-gray-50 rounded-xl p-4"
                    >
                      <div>
                        <p className="font-semibold">
                          {p.icon} {p.title}
                        </p>
                        <p className="text-sm text-gray-600">
                          {p.description}
                        </p>
                      </div>
                      <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-800">
                        {p.impact}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* COMPLAINTS */}
            <div className="bg-white border rounded-2xl shadow p-6">
              <h2 className="text-2xl font-bold mb-4">
                📢 Citizen Complaints ({complaints.length})
              </h2>

              {complaintsLoading ? (
                <p>Loading complaints…</p>
              ) : complaints.length === 0 ? (
                <p>No complaints reported.</p>
              ) : (
                <ul className="space-y-4">
                  {complaints.map((c, i) => (
                    <li key={i} className="bg-gray-50 rounded-xl p-4">
                      <p className="font-medium">{c.message}</p>
                      <div className="text-sm text-gray-600 flex justify-between mt-2">
                        <span>
                          🕒 {new Date(c.time).toLocaleString()}
                        </span>
                        <span className="bg-yellow-100 px-3 py-1 rounded-full">
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

/* ================= INFO ================= */

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-gray-600">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}
