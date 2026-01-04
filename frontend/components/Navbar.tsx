"use client";

type NavbarProps = {
  onMyLocation: () => void;
};

export default function Navbar({ onMyLocation }: NavbarProps) {
  return (
    <nav
      style={{
        width: "100%",
        padding: "1rem 2rem",
        background: "#0F2A44",
        color: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
        🌍 VayuVastra
      </div>

      <button
        onClick={onMyLocation}
        style={{
          padding: "0.5rem 1rem",
          background: "#1E88E5",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        📍 My Location
      </button>
    </nav>
  );
}
