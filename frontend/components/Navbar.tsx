"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Navbar({
  onMyLocation,
}: {
  onMyLocation?: () => void;
}) {
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ✅ AUTH-AWARE GOVERNMENT CLICK */
  const handleGovernmentClick = () => {
    const token = localStorage.getItem("gov_token");

    if (token) {
      router.push("/government");
    } else {
      router.push("/government/login");
    }
  };

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white shadow-md text-gray-900"
          : "bg-transparent text-white"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className={`text-xl font-bold ${
            scrolled ? "text-gray-900" : "text-white"
          }`}
        >
          VayuVastra
        </Link>

        {/* Links */}
        <div
          className={`hidden md:flex gap-8 font-medium ${
            scrolled ? "text-gray-800" : "text-white"
          }`}
        >
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          {onMyLocation && (
            <button
              onClick={onMyLocation}
              className="px-4 py-2 rounded-lg text-sm bg-blue-600 text-white hover:bg-blue-700"
            >
              My Location
            </button>
          )}

          {/* PUBLIC BUTTON (UNCHANGED) */}
          <Link
            href="/home"
            className={`px-4 py-2 rounded-lg text-sm border ${
              scrolled
                ? "border-gray-900 text-gray-900 hover:bg-gray-100"
                : "border-white text-white hover:bg-white hover:text-gray-900"
            }`}
          >
            Public
          </Link>

          {/* ✅ GOVERNMENT BUTTON (AUTH AWARE, SAME STYLE) */}
          <button
            onClick={handleGovernmentClick}
            className="px-4 py-2 rounded-lg text-sm bg-green-600 text-white hover:bg-green-700"
          >
            Government
          </button>
        </div>
      </div>
    </nav>
  );
}
