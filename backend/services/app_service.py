from datetime import datetime

def get_aqi_logic(ward):
    hour = datetime.now().hour

    # MOCK historical AQI
    historical_aqi = {
        "Rohini": 150,
        "Dwarka": 110
    }

    base_aqi = historical_aqi.get(ward, 120)

    traffic = "HIGH" if (8 <= hour <= 11 or 17 <= hour <= 20) else "NORMAL"
    final_aqi = base_aqi + (20 if traffic == "HIGH" else 0)

    risk = (
        "Good" if final_aqi <= 50 else
        "Moderate" if final_aqi <= 150 else
        "Poor"
    )

    precaution = (
        "Avoid outdoor activities" if risk == "Poor"
        else "Limit prolonged outdoor exposure"
        if risk == "Moderate"
        else "Safe for outdoor activities"
    )

    return {
        "ward": ward,
        "aqi": final_aqi,
        "risk_level": risk,
       "cause": (
    "Peak-hour traffic congestion"
    if traffic == "HIGH"
    else "Long-term pollution accumulation"
)
,
        "precaution": precaution,
        "source": "Historical + Traffic Model (Demo)"
    }
