import json

with open("data/ward.geojson", "r") as f:
    WARDS = json.load(f)["features"]

def get_ward_from_latlng(lat, lng):
    for ward in WARDS:
        name = ward["properties"].get("ward")
        bbox = ward["properties"].get("bbox")  # or precomputed bounds

        if not bbox:
            continue

        min_lng, min_lat, max_lng, max_lat = bbox
        if min_lat <= lat <= max_lat and min_lng <= lng <= max_lng:
            return name

    return None
