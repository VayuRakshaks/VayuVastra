from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import os
from datetime import datetime
from werkzeug.utils import secure_filename

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# -------------------------
# CREATE APP
# -------------------------
app = Flask(__name__)
CORS(app)

# -------------------------
# REGISTER BLUEPRINTS
# -------------------------
from services.auth import auth_bp
app.register_blueprint(auth_bp, url_prefix="/api/auth")

# -------------------------
# IN-MEMORY STORAGE
# -------------------------
COMPLAINTS = []

# -------------------------
# MOCK SENSOR DATA
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

# -------------------------
# AQI TIMESERIES
# -------------------------
MOCK_AQI_TIMESERIES = {
    "Rohini": [
        {"time": "10:00", "pm25": 65},
        {"time": "11:00", "pm25": 68},
        {"time": "12:00", "pm25": 72},
        {"time": "13:00", "pm25": 75},
        {"time": "14:00", "pm25": 73},
    ],
    "Minto Road (ITO – Civic Centre)": [
        {"time": "10:00", "pm25": 78},
        {"time": "11:00", "pm25": 82},
        {"time": "12:00", "pm25": 88},
        {"time": "13:00", "pm25": 91},
        {"time": "14:00", "pm25": 94},
    ],
    "Anand Vihar": [
        {"time": "10:00", "pm25": 85},
        {"time": "11:00", "pm25": 88},
        {"time": "12:00", "pm25": 92},
        {"time": "13:00", "pm25": 96},
        {"time": "14:00", "pm25": 99},
    ],
    "Lajpat Nagar": [
        {"time": "10:00", "pm25": 58},
        {"time": "11:00", "pm25": 61},
        {"time": "12:00", "pm25": 64},
        {"time": "13:00", "pm25": 67},
        {"time": "14:00", "pm25": 65},
    ],
    "Dwarka": [
        {"time": "10:00", "pm25": 45},
        {"time": "11:00", "pm25": 48},
        {"time": "12:00", "pm25": 52},
        {"time": "13:00", "pm25": 55},
        {"time": "14:00", "pm25": 53},
    ],
}

# -------------------------
# POLLUTION PROFILE LOGIC
# -------------------------
WARD_PROFILES = {
    "Anand Vihar": ["vehicular", "industrial"],
    "Minto Road (ITO – Civic Centre)": ["vehicular", "construction"],
    "Rohini": ["construction", "biomass"],
    "Dwarka": ["vehicular"],
    "Lajpat Nagar": ["vehicular", "construction"]
}

BASE_CONTRIBUTORS = {
    "vehicular": 30,
    "industrial": 20,
    "construction": 15,
    "biomass": 10,
    "others": 25
}

def format_label(key):
    return {
        "vehicular": "Vehicular Emissions",
        "industrial": "Industrial",
        "construction": "Construction Dust",
        "biomass": "Biomass & Others",
        "others": "Others"
    }[key]

def calculate_contributors(ward, pm25):
    contributors = BASE_CONTRIBUTORS.copy()
    dominant = WARD_PROFILES.get(ward, [])

    boost = 10 if pm25 > 90 else 5 if pm25 > 60 else 0

    for src in dominant:
        contributors[src] += boost
        contributors["others"] -= boost // max(len(dominant), 1)

    total = sum(contributors.values())
    return [
        {"label": format_label(k), "percent": round(v * 100 / total)}
        for k, v in contributors.items()
        if v > 0
    ]

# -------------------------
# HELPERS
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

def classify_pm25(pm25):
    if pm25 <= 30:
        return "Good", "Air quality is good."
    elif pm25 <= 60:
        return "Moderate", "Sensitive people should reduce outdoor activity."
    elif pm25 <= 90:
        return "Poor", "Avoid outdoor exercise."
    else:
        return "Severe", "Stay indoors. Avoid exposure."

# -------------------------
# ROOT
# -------------------------
@app.route("/")
def home():
    return jsonify({"service": "VayuVastra Backend", "status": "running"})

# -------------------------
# WARDS
# -------------------------
@app.route("/api/wards")
def get_all_wards():
    result = []
    for ward, data in MOCK_SENSOR_DATA.items():
        level, _ = classify_pm25(data["pm25"])
        result.append({
            "ward": ward,
            "station": data["station"],
            "pm25": data["pm25"],
            "risk_level": level
        })
    return jsonify(result)

@app.route("/api/wards/high-risk")
def get_high_risk_wards():
    return jsonify([
        w for w in get_all_wards().json
        if w["risk_level"] in ["Poor", "Severe"]
    ])

# -------------------------
# GEOJSON
# -------------------------
@app.route("/api/wards/geojson")
def get_ward_geojson():
    path = os.path.join(os.path.dirname(__file__), "data", "ward.geojson")
    if not os.path.exists(path):
        return jsonify({"type": "FeatureCollection", "features": []})
    with open(path, "r", encoding="utf-8") as f:
        return jsonify(json.load(f))

# -------------------------
# AQI (FINAL SINGLE ROUTE)
# -------------------------
@app.route("/api/aqi/<city>/<ward>")
def get_aqi(city, ward):
    normalized = normalize_name(ward)

    for key, data in MOCK_SENSOR_DATA.items():
        if normalize_name(key) == normalized:
            pm25 = data["pm25"]
            level, advice = classify_pm25(pm25)

            return jsonify({
                "city": city,
                "station": data["station"],
                "pm25": pm25,
                "risk_level": level,
                "precaution": advice,
                "contributors": calculate_contributors(key, pm25),
                "data_source": "Mock CPCB Sensor (Demo Mode)"
            })

    return jsonify({"error": "Ward not found"}), 404

# -------------------------
# AQI HISTORY
# -------------------------
@app.route("/api/aqi/history/<ward>")
def get_history(ward):
    ward = normalize_name(ward)
    for key, data in MOCK_AQI_TIMESERIES.items():
        if normalize_name(key) == ward:
            return jsonify(data)
    return jsonify([])

# -------------------------
# COMPLAINTS
# -------------------------
@app.route("/api/complaints", methods=["POST"])
def submit_complaint():
    
    message = request.form.get("message")
    city = request.form.get("city")
    ward = request.form.get("ward")

    file = request.files.get("media")
    filename = None

    if file:
        filename = secure_filename(file.filename)
        file.save(os.path.join(UPLOAD_FOLDER, filename))

    complaint = {
        "id": len(COMPLAINTS) + 1,
        "city": city,
        "ward": ward,
        "message": message,
        "media": filename,
        "time": datetime.now().isoformat(),
        "status": "Open"
    }

    COMPLAINTS.append(complaint)

    return jsonify({"success": True, "complaint": complaint}), 201

@app.route("/api/complaints", methods=["GET"])
def get_complaints():
    ward = request.args.get("ward")

    if ward:
        ward = ward.strip().lower()
        return jsonify([
            c for c in COMPLAINTS
            if c["ward"] and c["ward"].strip().lower() == ward
        ])

    return jsonify(COMPLAINTS)

# -------------------------
# RUN
# -------------------------
if __name__ == "__main__":
    app.run(debug=True, use_reloader=False)
