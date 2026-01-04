from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # ✅ THIS FIXES "Failed to fetch"

# -------------------------
# Mock government sensor data
# -------------------------
MOCK_SENSOR_DATA = {
    "Rohini": {"station": "Rohini Sector 16", "pm25": 72},
    "Dwarka": {"station": "Dwarka Sector 8", "pm25": 55},
    "Anand Vihar": {"station": "Anand Vihar ISBT", "pm25": 96},
    "Lajpat Nagar": {"station": "Lajpat Nagar Central", "pm25": 64},
}


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

# -------------------------
# AQI API
# -------------------------
@app.route("/api/aqi/<city>/<ward>")
def get_aqi(city, ward):
    city_data = MOCK_SENSOR_DATA.get(city)

    if not city_data:
        return jsonify({
            "city": city,
            "message": "City data not available"
        }), 404

    pm25 = city_data["pm25"]
    level, advice = classify_pm25(pm25)

    return jsonify({
        "city": city,
        "station": f"{ward} Monitoring Station",
        "pm25": pm25,
        "risk_level": level,
        "precaution": advice,
        "data_source": "Mock CPCB Sensor (Demo Mode)"
    })

# -------------------------
# Run app
# -------------------------
if __name__ == "__main__":
    app.run(debug=True)


# if we use AQICN
# from flask import Flask, jsonify
# import requests

# app = Flask(__name__)

# # =========================
# # CONFIG
# # =========================
# AQICN_TOKEN = "YOUR_AQICN_TOKEN_HERE"

# # Mock CPCB-style fallback data
# MOCK_SENSOR_DATA = {
#     "Delhi": {"station": "Anand Vihar", "pm25": 86},
#     "Mumbai": {"station": "Bandra", "pm25": 42},
#     "Kolkata": {"station": "Salt Lake", "pm25": 58},
# }

# # =========================
# # PM2.5 Classification
# # =========================
# def classify_pm25(pm25):
#     if pm25 <= 30:
#         return "Good", "Air quality is good. Normal outdoor activities are safe."
#     elif pm25 <= 60:
#         return "Moderate", "Sensitive people should reduce prolonged outdoor activity."
#     elif pm25 <= 90:
#         return "Poor", "Avoid outdoor exercise. Wear masks if stepping out."
#     else:
#         return "Severe", "Stay indoors. Avoid outdoor exposure."

# # =========================
# # Root route
# # =========================
# @app.route("/")
# def home():
#     return jsonify({
#         "service": "VayuVastra Backend",
#         "mode": "AQICN + Mock Fallback",
#         "status": "running"
#     })

# # =========================
# # AQI API
# # =========================
# @app.route("/api/aqi/<city>")
# def get_aqi(city):
#     # -------------------------
#     # 1️⃣ Try AQICN (LIVE)
#     # -------------------------
#     try:
#         url = f"https://api.waqi.info/feed/{city}/?token={AQICN_TOKEN}"
#         res = requests.get(url, timeout=10).json()

#         if res.get("status") == "ok":
#             data = res.get("data", {})
#             pm25 = data.get("iaqi", {}).get("pm25", {}).get("v")

#             if pm25 is not None:
#                 level, advice = classify_pm25(pm25)
#                 return jsonify({
#                     "city": city,
#                     "station": data.get("city", {}).get("name"),
#                     "pm25": pm25,
#                     "risk_level": level,
#                     "precaution": advice,
#                     "data_source": "AQICN (Live Public Data)"
#                 })
#     except Exception:
#         pass

#     # -------------------------
#     # 2️⃣ Fallback: Mock CPCB
#     # -------------------------
#     fallback = MOCK_SENSOR_DATA.get(city)

#     if fallback:
#         pm25 = fallback["pm25"]
#         level, advice = classify_pm25(pm25)
#         return jsonify({
#             "city": city,
#             "station": fallback["station"],
#             "pm25": pm25,
#             "risk_level": level,
#             "precaution": advice,
#             "data_source": "Mock CPCB Sensor (Demo Fallback)"
#         })

#     # -------------------------
#     # 3️⃣ No data available
#     # -------------------------
#     return jsonify({
#         "city": city,
#         "message": "No air quality data available"
#     }), 404

# # =========================
# # Run app
# # =========================
# if __name__ == "__main__":
#     app.run(debug=True)
