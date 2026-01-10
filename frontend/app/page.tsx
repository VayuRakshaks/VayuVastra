"use client";

import Navbar from "@/components/Navbar";

export default function LandingPage() {
  return (
    <>
      <Navbar />

      {/* HERO */}
      <section
        className="relative h-screen flex items-center justify-center text-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1503387762-592deb58ef4e')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/60" />

        {/* Content */}
        <div className="relative z-10 max-w-4xl px-6 text-white">
          <h1 className="text-4xl md:text-6xl font-bold leading-tight">
            Ward-wise Air Quality <br /> Intelligence for India
          </h1>

          <p className="mt-6 text-lg text-gray-200">
            Real-time PM2.5 monitoring, health insights, and policy-ready
            dashboards — from citizens to governments.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/home"
              className="px-8 py-3 rounded-full bg-blue-600 hover:bg-blue-700 transition"
            >
              View Public Dashboard
            </a>

            <a
              href="/government"
              className="px-8 py-3 rounded-full bg-white text-gray-900 hover:bg-gray-200 transition"
            >
              Government Dashboard
            </a>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Why Ward-Level AQI Matters
          </h2>
          <p className="text-gray-700 leading-relaxed">
            City-wide air quality averages hide local pollution hotspots.
            VayuVastra provides micro-level ward data to enable faster response,
            smarter policy, and better health outcomes.
          </p>
        </div>
      </section>

      {/* DASHBOARDS */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12">
          <div className="p-8 rounded-2xl shadow-lg hover:scale-105 transition">
            <h3 className="text-xl font-semibold mb-4">
              👥 Public Dashboard
            </h3>
            <p className="text-gray-700 mb-6">
              Live AQI, precautions, emergency alerts, and location-based
              insights for citizens.
            </p>
            <a
              href="/home"
              className="inline-block text-blue-600 font-semibold"
            >
              Explore →
            </a>
          </div>

          <div className="p-8 rounded-2xl shadow-lg hover:scale-105 transition">
            <h3 className="text-xl font-semibold mb-4">
              🏛 Government Dashboard
            </h3>
            <p className="text-gray-700 mb-6">
              Ward heatmaps, high-risk detection, and decision-ready analytics
              for authorities.
            </p>
            <a
              href="/government"
              className="inline-block text-green-600 font-semibold"
            >
              Explore →
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 bg-gray-900 text-gray-300 text-center">
        <p>© {new Date().getFullYear()} VayuVastra</p>
        <p className="text-sm mt-2">
          Academic & Demonstration Project — Data Source: Mock CPCB
        </p>
      </footer>
    </>
  );
}
