"""High-performance Python Backend Server for Used Car Price Prediction.
Serves REST API endpoints and the modern React / Tailwind frontend.
Run: python server.py --port 8000
"""
import argparse
import json
import mimetypes
from http.server import HTTPServer, BaseHTTPRequestHandler
from pathlib import Path
import urllib.parse
import joblib
import pandas as pd
import numpy as np

ROOT = Path(__file__).resolve().parent
MODEL_PATH = ROOT / "models" / "best_model.pkl"
META_PATH = ROOT / "models" / "meta.json"
RESULTS_PATH = ROOT / "reports" / "results.csv"

# Prefer the built Vite React app if available, otherwise fallback to web/
REACT_DIST = ROOT / "car-valuation-app-configuration" / "dist"
WEB_FALLBACK = ROOT / "web"

model = None
meta = None

def get_web_dir():
    if (REACT_DIST / "index.html").exists():
        return REACT_DIST
    return WEB_FALLBACK

def load_resources():
    global model, meta
    if MODEL_PATH.exists() and META_PATH.exists():
        try:
            model = joblib.load(MODEL_PATH)
            meta = json.loads(META_PATH.read_text(encoding="utf-8"))
            print(f"[Loaded] Model: {meta.get('best_model', 'Unknown')}")
        except Exception as e:
            print(f"[Error] Failed to load model/meta: {e}")

def format_inr(number):
    """Format integer to Indian Lakh / Crore currency string."""
    num = float(number)
    if num >= 10000000:
        return f"₹{num / 10000000:.2f} Crore"
    elif num >= 100000:
        return f"₹{num / 100000:.2f} Lakh"
    else:
        return f"₹{num:,.0f}"

BRAND_LIQUIDITY = {
    "Maruti": 1.0, "Hyundai": 0.95, "Toyota": 0.94, "Honda": 0.88, "Tata": 0.85,
    "Mahindra": 0.85, "Kia": 0.86, "Ford": 0.62, "Renault": 0.6, "Nissan": 0.58,
    "Volkswagen": 0.6, "Skoda": 0.55, "Mg": 0.6, "Jeep": 0.5, "Bmw": 0.48,
    "Audi": 0.46, "Mercedes-Benz": 0.5, "Volvo": 0.38, "Jaguar": 0.3, "Land": 0.33,
    "Mitsubishi": 0.3, "Isuzu": 0.35, "Force": 0.3, "Chevrolet": 0.3, "Fiat": 0.25,
    "Datsun": 0.3, "Daewoo": 0.15, "Ambassador": 0.18, "Opelcorsa": 0.15,
}

def build_insights(brand, fuel, transmission, seller_type, owner, car_age, km_driven, km_per_year, demand):
    liq = BRAND_LIQUIDITY.get(brand, 0.5)
    brand_note = (
        f"{brand} enjoys active resale liquidity with steady market valuation."
        if liq >= 0.85
        else f"{brand} holds a moderate resale footprint — pricing is negotiation sensitive."
        if liq >= 0.55
        else f"{brand} is a niche-liquidity nameplate in the pre-owned market."
    )
    fuel_note = (
        f"Electric powertrain with {transmission} drive."
        if fuel == "Electric"
        else f"{fuel} conversion lowers running cost but trims resale by design."
        if fuel in ["CNG", "LPG"]
        else f"{fuel} powertrain paired with {transmission} transmission."
    )
    usage_note = f"{car_age} year{'s' if car_age != 1 else ''} old with {km_driven:,.0f} km on the odometer."

    return [
        {"icon": "⚡", "title": "Brand Pricing Factor", "description": brand_note},
        {"icon": "⛽", "title": "Fuel Economy Impact", "description": fuel_note},
        {"icon": "⏱️", "title": "Odometer & Age Correlation", "description": usage_note},
        {
            "icon": "🛣️" if km_per_year > 15000 else "📉",
            "title": "Usage Intensity",
            "description": f"{km_per_year:,.0f} km/year is {'above the 12,000 km national average' if km_per_year > 15000 else 'below the 12,000 km national average, supporting a premium band.'}"
        },
        {
            "icon": "🤝",
            "title": "Channel & Ownership",
            "description": f"{owner} via {seller_type} channel."
        },
        {
            "icon": "📊",
            "title": "Market Demand Signal",
            "description": f"Composite demand index classifies this configuration as {demand.lower()}."
        }
    ]

class RequestHandler(BaseHTTPRequestHandler):
    def _send_json(self, data, status=200):
        body = json.dumps(data).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        if path in ["/health", "/api/health"]:
            self._send_json({"status": "ok", "model": meta.get("best_model", "Loaded") if meta else "Ready"})
            return

        if path in ["/meta", "/api/meta"]:
            if not META_PATH.exists():
                self._send_json({"error": "Metadata not ready. Train model first."}, 503)
                return
            current_meta = json.loads(META_PATH.read_text(encoding="utf-8"))
            self._send_json(current_meta)
            return

        if path in ["/models", "/api/models"]:
            if not RESULTS_PATH.exists():
                self._send_json({"models": []})
                return
            df = pd.read_csv(RESULTS_PATH)
            self._send_json({"models": df.to_dict(orient="records")})
            return

        # Serve static files from React build or web/
        web_dir = get_web_dir()
        req_path = path.lstrip("/")
        if req_path == "" or req_path == "/":
            req_path = "index.html"

        file_path = (web_dir / req_path).resolve()

        # SPA fallback: if file doesn't exist and not an api route, serve index.html
        if not file_path.exists() and not req_path.startswith("api"):
            file_path = (web_dir / "index.html").resolve()

        if file_path.exists() and file_path.is_file():
            mime_type, _ = mimetypes.guess_type(str(file_path))
            if not mime_type:
                mime_type = "application/octet-stream"
            
            content = file_path.read_bytes()
            self.send_response(200)
            self.send_header("Content-Type", mime_type)
            self.send_header("Content-Length", str(len(content)))
            self.end_headers()
            self.wfile.write(content)
        else:
            self.send_error(404, "File Not Found")

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path in ["/predict", "/api/predict"]:
            global model, meta
            if model is None or meta is None:
                load_resources()
            
            if model is None:
                self._send_json({"error": "Model not loaded. Please train first."}, 503)
                return

            length = int(self.headers.get("Content-Length", 0))
            if length == 0:
                self._send_json({"error": "Empty request body"}, 400)
                return

            body = self.rfile.read(length).decode("utf-8")
            try:
                data = json.loads(body)
                km = float(data.get("km_driven", 40000))
                age = float(data.get("car_age", 5))
                brand = str(data.get("brand", "Maruti"))
                fuel = str(data.get("fuel", "Diesel"))
                seller_type = str(data.get("seller_type", "Individual"))
                transmission = str(data.get("transmission", "Manual"))
                owner = str(data.get("owner", "First Owner"))
                km_per_year = round(km / max(age, 1), 2)

                row_dict = {
                    "km_driven": km,
                    "car_age": age,
                    "km_per_year": km_per_year,
                    "brand": brand,
                    "fuel": fuel,
                    "seller_type": seller_type,
                    "transmission": transmission,
                    "owner": owner,
                }
                row_df = pd.DataFrame([row_dict])
                
                # Model prediction
                pred = float(model.predict(row_df)[0])
                pred = max(pred, 28000)

                # Price range estimate (fair market band +/- 7.5%)
                margin = pred * 0.075
                low_estimate = max(pred - margin, 20000)
                high_estimate = pred + margin

                # Depreciation estimate
                depreciation_rate = min(age * 8.5, 80.0)

                # Demand calculation
                liq = BRAND_LIQUIDITY.get(brand, 0.5)
                score = liq * 55 + max(0, 25 - age) * 1.1 + (12 if km_per_year < 10000 else 7 if km_per_year < 15000 else 0)
                score = min(100, round(score))
                demand = "Very High Demand" if score >= 86 else "High Demand" if score >= 70 else "Moderate Demand" if score >= 52 else "Low Demand"

                insights = build_insights(brand, fuel, transmission, seller_type, owner, age, km, km_per_year, demand)

                response = {
                    "success": True,
                    "predicted_price": round(pred),
                    "formatted_price": format_inr(pred),
                    "price_inr": f"₹{pred:,.0f}",
                    "range_low": round(low_estimate),
                    "range_high": round(high_estimate),
                    "range_low_formatted": format_inr(low_estimate),
                    "range_high_formatted": format_inr(high_estimate),
                    "range_text": f"{format_inr(low_estimate)} – {format_inr(high_estimate)}",
                    "depreciation_pct": round(depreciation_rate, 1),
                    "km_per_year": round(km_per_year),
                    "best_model": meta.get("best_model", "Trained ML Model"),
                    "market_demand": demand,
                    "demand_score": score,
                    "insights": insights,
                    "source": "api"
                }
                self._send_json(response)
            except Exception as ex:
                self._send_json({"error": f"Prediction failed: {str(ex)}"}, 500)
            return

        self.send_error(404, "Endpoint Not Found")

def main():
    parser = argparse.ArgumentParser(description="Run Used Car Price Prediction Server")
    parser.add_argument("--port", type=int, default=8000, help="Port to listen on (default: 8000)")
    parser.add_argument("--host", type=str, default="127.0.0.1", help="Host address (default: 127.0.0.1)")
    args = parser.parse_args()

    load_resources()
    server_address = (args.host, args.port)
    httpd = HTTPServer(server_address, RequestHandler)
    print(f"\n=======================================================")
    print(f" [OK] Used Car Price Predictor Web App is live!")
    print(f" URL: http://{args.host}:{args.port}")
    print(f" API: http://{args.host}:{args.port}/predict")
    print(f" Serving UI from: {get_web_dir().relative_to(ROOT)}")
    print(f"=======================================================\n")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping server...")
        httpd.server_close()

if __name__ == "__main__":
    main()
