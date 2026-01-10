from flask import Blueprint, request, jsonify
import jwt
import datetime

auth_bp = Blueprint("auth", __name__)

GOV_USER = {
    "email": "admin@gov.in",
    "password": "gov123"
}

SECRET_KEY = "dev_secret_key"

@auth_bp.route("/login", methods=["POST"])
def gov_login():
    data = request.get_json()

    if not data:
        return jsonify({"message": "Missing JSON body"}), 400

    email = data.get("email")
    password = data.get("password")

    if email != GOV_USER["email"] or password != GOV_USER["password"]:
        return jsonify({"message": "Invalid credentials"}), 401

    token = jwt.encode(
        {
            "email": email,
            "role": "government",
            "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=1)
        },
        SECRET_KEY,
        algorithm="HS256"
    )

    return jsonify({"token": token})
