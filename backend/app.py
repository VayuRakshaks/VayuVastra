from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import os

# -------------------------
# In-memory complaint store (demo)
# -------------------------
COMPLAINTS = []


# -------------------------
# CREATE APP (ONCE)
# -------------------------
app = Flask(__name__)
CORS(app)

# -------------------------
# REGISTER BLUEPRINTS
# -------------------------
from services.auth import auth_bp
app.register_blueprint(auth_bp, url_prefix="/api/auth")

# -------------------------
# Mock government sensor data
# -------------------------
MOCK_SENSOR_DATA = {
    "Minto Road (ITO – Civic Centre)": {
        "station": "ITO / MCD Civic Centre",
        "pm25": 88
    },
    "Rohini": {"station": "Rohini Sector 16", "pm25": 72},
    "Dwarka": {"station": "Dwarka Sector 8", "pm25": 55},
    "Anand Vihar": {"station": "Anand Vihar ISBT", "pm25": 96},
    "Lajpat Nagar": {"station": "Lajpat Nagar Central", "pm25": 64},
}

# Add below MOCK_SENSOR_DATA

MOCK_AQI_TIMESERIES = {
    "Rohini": [
        {"time": "10:00", "pm25": 68},
        {"time": "11:00", "pm25": 70},
        {"time": "12:00", "pm25": 72},
        {"time": "13:00", "pm25": 75},
        {"time": "14:00", "pm25": 73},
    ],
    "Minto Road (ITO – Civic Centre)": [
        {"time": "10:00", "pm25": 80},
        {"time": "11:00", "pm25": 85},
        {"time": "12:00", "pm25": 88},
        {"time": "13:00", "pm25": 90},
        {"time": "14:00", "pm25": 92},
    ]
}

# -------------------------
# Helpers
# -------------------------
def normalize_name(name):
    return (
        name.lower()
        .replace("–", "-")
        .replace("—", "-")
        .replace("(", "")
        .replace(")", "")
        .replace("/", "")
        .strip()
    )

# -------------------------
# PM2.5 classification
# -------------------------
def classify_pm25(pm25):
    if pm25 <= 30:
        return "Good", "Air quality is good. Normal outdoor activities are safe."
    elif pm25 <= 60:
        return "Moderate", "Sensitive people should reduce prolonged outdoor activity."
    elif pm25 <= 90:
        return "Poor", "Avoid outdoor exercise. Wear masks if stepping out."
    else:
        return "Severe", "Stay indoors. Avoid outdoor exposure."

# -------------------------
# Root route
# -------------------------
@app.route("/")
def home():
    return jsonify({
        "service": "VayuVastra Backend",
        "mode": "mock-data",
        "status": "running"
    })

# =====================================================
# GOVERNMENT DASHBOARD APIS
# =====================================================

@app.route("/api/wards")
def get_all_wards():
    wards = []

    for ward, data in MOCK_SENSOR_DATA.items():
        pm25 = data["pm25"]
        level, _ = classify_pm25(pm25)

        wards.append({
            "ward": ward,
            "station": data["station"],
            "pm25": pm25,
            "risk_level": level
        })

    return jsonify(wards)

@app.route("/api/wards/high-risk")
def get_high_risk_wards():
    high_risk = []

    for ward, data in MOCK_SENSOR_DATA.items():
        pm25 = data["pm25"]
        level, _ = classify_pm25(pm25)

        if level in ["Poor", "Severe"]:
            high_risk.append({
                "ward": ward,
                "station": data["station"],
                "pm25": pm25,
                "risk_level": level
            })

    return jsonify(high_risk)

@app.route("/api/wards/geojson")
def get_ward_geojson():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    geojson_path = os.path.join(base_dir, "data", "ward.geojson")

    if not os.path.exists(geojson_path):
        return jsonify({
            "type": "FeatureCollection",
            "features": []
        })

    with open(geojson_path, "r", encoding="utf-8") as f:
        geojson_data = json.load(f)

    return jsonify(geojson_data)

# =====================================================
# CITIZEN / WARD DETAIL API
# =====================================================
@app.route("/api/aqi/<city>/<ward>")
def get_aqi(city, ward):
    ward = normalize_name(ward)

    for key, data in MOCK_SENSOR_DATA.items():
        if normalize_name(key) == ward:
            pm25 = data["pm25"]
            level, advice = classify_pm25(pm25)

            return jsonify({
                "city": city,
                "station": data["station"],
                "pm25": pm25,
                "risk_level": level,
                "precaution": advice,
                "data_source": "Mock CPCB Sensor (Demo Mode)"
            })

    return jsonify({
        "city": city,
        "station": ward,
        "pm25": 55,
        "risk_level": "Moderate",
        "precaution": "Fallback demo data",
        "data_source": "Mock Fallback"
    })
@app.route("/api/aqi/history/<ward>")
def get_aqi_history(ward):
    ward = normalize_name(ward)

    for key, history in MOCK_AQI_TIMESERIES.items():
        if normalize_name(key) == ward:
            return jsonify(history)

    return jsonify([])


# -------------------------
# Mock complaints storage
# -------------------------
COMPLAINTS = []

@app.route("/api/complaints", methods=["POST"])
def submit_complaint():
    data = request.json

    required_fields = ["city", "ward", "issue"]
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields"}), 400

    complaint = {
        "id": len(COMPLAINTS) + 1,
        "city": data["city"],
        "ward": data["ward"],
        "issue": data["issue"],
        "timestamp": data.get("timestamp"),
        "status": "Pending"
    }

    COMPLAINTS.append(complaint)

    return jsonify({
        "message": "Complaint submitted successfully",
        "complaint_id": complaint["id"]
    }), 201


# =====================================================
# 🛑 COMPLAINTS (IN-MEMORY)
# =====================================================

complaints = []

@app.route("/api/complaints", methods=["POST"])
def submit_complaint():
    data = request.json

    complaint = {
        "city": data.get("city"),
        "ward": data.get("ward"),
        "message": data.get("message"),
        "timestamp": data.get("timestamp"),
        "status": "Pending"
    }

    complaints.append(complaint)

    return jsonify({
        "success": True,
        "message": "Complaint registered successfully"
    }), 201


@app.route("/api/complaints", methods=["GET"])
def get_complaints():
    return jsonify(complaints)

from datetime import datetime

@app.route("/api/complaints", methods=["POST"])
def submit_complaint():
    data = request.json

    if not data:
        return jsonify({"error": "Invalid data"}), 400

    complaint = {
        "id": len(COMPLAINTS) + 1,
        "city": data.get("city"),
        "ward": data.get("ward"),
        "message": data.get("message"),
        "time": datetime.now().isoformat(),
        "status": "Open"
    }

    COMPLAINTS.append(complaint)

    return jsonify({
        "success": True,
        "complaint": complaint
    }), 201

@app.route("/api/complaints", methods=["GET"])
def get_complaints():
    ward = request.args.get("ward")

    if ward:
        filtered = [
            c for c in COMPLAINTS
            if c["ward"].lower() == ward.lower()
        ]
        return jsonify(filtered)

    return jsonify(COMPLAINTS)



# -------------------------
# Run app
# -------------------------
if __name__ == "__main__":
    app.run(debug=True, use_reloader=False)
