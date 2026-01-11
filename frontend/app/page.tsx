"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";

/* 📰 MOCK NEWS DATA (CITY-WISE) */
const CITY_NEWS: Record<
  string,
  { title: string; source: string; link: string }[]
> = {
  Delhi: [
    {
      title: "Delhi AQI remains in ‘Poor’ category for third consecutive day",
      source: "CPCB Bulletin",
      link: "https://cpcb.nic.in/air-quality-monitoring/",
    },
    {
      title: "Construction dust major contributor to winter pollution",
      source: "PIB India",
      link: "https://pib.gov.in/PressReleasePage.aspx",
    },
    {
      title: "Odd-even scheme may return if AQI worsens",
      source: "The Hindu",
      link: "https://www.thehindu.com/news/cities/Delhi/",
    },
  ],

  Mumbai: [
    {
      title: "Mumbai AQI deteriorates near industrial belts",
      source: "MPCB Report",
      link: "https://mpcb.gov.in/air-quality",
    },
    {
      title: "Vehicular emissions spike during peak hours",
      source: "Times of India",
      link: "https://timesofindia.indiatimes.com/city/mumbai",
    },
  ],

  Bengaluru: [
    {
      title: "Bengaluru sees rise in PM2.5 due to traffic congestion",
      source: "KSPCB",
      link: "https://kspcb.karnataka.gov.in/",
    },
    {
      title: "Citizens urged to reduce private vehicle usage",
      source: "Deccan Herald",
      link: "https://www.deccanherald.com/city/bengaluru",
    },
  ],

  Chennai: [
    {
      title: "Air quality stable but humidity impacts pollution levels",
      source: "TNPCB",
      link: "https://tnpcb.gov.in/",
    },
    {
      title: "Industrial emissions under monitoring",
      source: "The Hindu",
      link: "https://www.thehindu.com/news/cities/chennai/",
    },
  ],
};

export default function LandingPage() {
  const [selectedCity, setSelectedCity] = useState("Delhi");

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
        <div className="absolute inset-0 bg-black/60" />

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
      <section className="py-24 bg-balck-600 text-white">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Why Ward-Level AQI Matters
          </h2>
          <p className="text-gray-200 leading-relaxed">
            City-wide air quality averages hide local pollution hotspots.
            VayuVastra provides micro-level ward data to enable faster response,
            smarter policy, and better health outcomes.
          </p>
        </div>
      </section>

      {/* 📰 LIVE CITY-WISE NEWS */}
      <section className="py-24 bg-blue-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between mb-12">
            <h2 className="text-3xl font-bold text-gray-800">
              📰 Air Quality & Environment Updates
            </h2>

            {/* City Selector */}
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="mt-4 md:mt-0 px-4 py-2 rounded-lg border border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-[#000047]  text-font-medium"
            >
              {Object.keys(CITY_NEWS).map((city) => (
                <option key={city}>{city}</option>
              ))}
            </select>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {CITY_NEWS[selectedCity].map((news, index) => (
              <div
                key={index}
                className="bg--400 p-6 rounded-2xl shadow hover:shadow-lg transition"
              >
                <h3 className="text-lg font-semibold mb-3 text-gray-900">
                  {news.title}
                </h3>

                <p className="text-sm text-gray-500 mb-4">
                  Source: {news.source}
                </p>

                <a
                  href={news.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-700 font-semibold text-sm hover:underline"
                >
                  Read more →
                </a>
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-gray-500 mt-10">
            News feed shown using demo data. Live integration supported via
            official government and verified news APIs.
          </p>
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