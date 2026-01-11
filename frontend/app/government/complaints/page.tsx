"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";



type Complaint = {
  city: string;
  ward: string;
  message: string;
  timestamp: string;
  status: string;
};


export default function GovtComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/complaints")
      .then((res) => res.json())
      .then((data) => {
        setComplaints(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);
  const [selectedWard, setSelectedWard] = useState("All");

const wards = [
  "All",
  "Rohini",
  "Dwarka",
  "Anand Vihar",
  "Lajpat Nagar",
  "Minto Road (ITO – Civic Centre)"
];

const filteredComplaints =
  selectedWard === "All"
    ? complaints
    : complaints.filter((c) => c.ward === selectedWard);


  return (
    <>
      <Navbar/>

      <main className="min-h-screen bg-gray-50 px-6 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Government Complaints Dashboard
        </h1>
        <p className="text-gray-600 mb-6">
          Citizen-reported pollution issues
        </p>

        {loading && <p>Loading complaints...</p>}

        {!loading && complaints.length === 0 && (
          <p className="text-gray-600">No complaints received yet.</p>
        )}
        <div className="mb-4 flex gap-4 items-center">
  <label className="font-medium text-gray-700">
    Filter by Ward:
  </label>

  <select
    value={selectedWard}
    onChange={(e) => setSelectedWard(e.target.value)}
    className="border text-black rounded px-3 text-grey-700 py-1"
  >
    {wards.map((w) => (
      <option key={w} value={w}>
        {w}
      </option>
    ))}
  </select>
</div>


        {!loading && complaints.length > 0 && (
          <div className="bg-white rounded-xl shadow overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="p-3 text-left">City</th>
                  <th className="p-3 text-left">Ward</th>
                  <th className="p-3 text-left">Complaint</th>
                  <th className="p-3 text-left">Time</th>
                  <th className="p-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredComplaints.map((c, i) => (
                  <tr
                    key={i}
                    className="border-t hover:bg-gray-50 transition"
                  >
                    <td className="p-3  text-gray-600" >{c.city}</td>
                    <td className="p-3  text-gray-600 font-medium">{c.ward}</td>
                    <td className="p-3 text-gray-600 ">{c.message}</td>
                    <td className="p-3 text-gray-600">
                      {new Date(c.timestamp).toLocaleString()}
                    </td>
                    <td className="p-3">
                      <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-semibold">
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  );
}
