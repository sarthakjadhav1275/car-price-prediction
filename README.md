# Used Car Price Prediction (AutoValuate AI)

Predict pre-owned vehicle `selling_price` (INR) using machine learning regression models (Linear Regression, Ridge Regression, Gradient Boosting, Tuned Random Forest, Decision Tree).

## Quick Start
```bash
pip install -r requirements.txt

# 1. Train models and generate benchmarks & figures
python src/train.py --data data/car_data.csv

# 2. Launch the Modern Web Application (HTML / CSS / JS + Python Backend)
python server.py --port 8000
# Open http://127.0.0.1:8000 in your browser

# Optional: Streamlit interface
streamlit run app.py
```

## Structure
- `data/car_data.csv`: CarDekho vehicle dataset.
- `src/train.py`: Data cleaning, feature engineering, model training, evaluation & metrics generation.
- `server.py`: REST API & static web server serving the frontend.
- `web/`: Modern glassmorphic responsive UI (`index.html`, `style.css`, `app.js`).
- `models/`: Serialized model pipeline (`best_model.pkl`) and metadata (`meta.json`).
- `reports/`: `results.csv` and evaluation figures in `reports/figures/`.
