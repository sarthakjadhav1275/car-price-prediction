"""Streamlit demo for Used Car Price Prediction.
Run: streamlit run app.py   (after python src/train.py)
"""
import json
from pathlib import Path

import joblib
import pandas as pd
import streamlit as st

ROOT = Path(__file__).resolve().parent
MODEL_PATH = ROOT / "models" / "best_model.pkl"
META_PATH = ROOT / "models" / "meta.json"

st.set_page_config(page_title="Used Car Price Predictor", page_icon="🚗")
st.title("🚗 Used Car Price Predictor")

if not MODEL_PATH.exists():
    st.error("Model not found. Run `python src/train.py` first.")
    st.stop()


@st.cache_resource
def load():
    return joblib.load(MODEL_PATH), json.loads(META_PATH.read_text())


model, meta = load()
st.caption(f"Model in use: {meta['best_model']}")

c = meta["choices"]
col1, col2 = st.columns(2)
with col1:
    brand = st.selectbox("Brand", c["brand"])
    fuel = st.selectbox("Fuel type", c["fuel"])
    transmission = st.selectbox("Transmission", c["transmission"])
with col2:
    owner = st.selectbox("Owner", c["owner"])
    seller_type = st.selectbox("Seller type", c["seller_type"])
    age = st.slider("Car age (years)", *meta["ranges"]["car_age"], value=5)
km = st.number_input("Kilometres driven", 0, meta["ranges"]["km_driven"][1], 40000, step=1000)

if st.button("Predict price", type="primary"):
    row = pd.DataFrame([{
        "km_driven": km, "car_age": age, "brand": brand, "fuel": fuel,
        "seller_type": seller_type, "transmission": transmission, "owner": owner,
    }])
    price = float(model.predict(row)[0])
    st.success(f"Estimated resale price: ₹{price:,.0f}")
