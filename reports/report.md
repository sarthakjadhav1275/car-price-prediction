# Project Report: Used Car Price Prediction

**Course:** Machine Learning Mini Project | BE B, Computer Engineering | A.Y. 2026-27  
**Group:** B5 (CSD 47, 48, 49, 50)

## 1. Problem Definition
Resale price depends on age, kilometres, fuel, transmission, ownership and brand. This project predicts `selling_price` (INR) with three regression models and serves the best pipeline in Streamlit.

## 2. Dataset
Kaggle CarDekho Vehicle Dataset (`CAR DETAILS FROM CAR DEKHO.csv`): 4340 rows × 8 columns raw; 3506 rows after dropping duplicates and the top 1% of price and km.

## 3. Data Preprocessing
Duplicates and impossible values removed. `brand` taken from the first token of `name`; `car_age = 2026 - year`. StandardScaler and OneHotEncoder (`handle_unknown="ignore"`) live inside a sklearn `Pipeline` fitted only on the training split. The target is trained as `log1p(selling_price)`.

## 4. EDA
Price is right-skewed (hence the log target). Price falls with age and kilometres. Automatic and premium-brand cars list higher. Figures: `reports/figures/price_distribution.png`, `price_vs_km.png`, `price_vs_age.png`, `correlation_heatmap.png`.

## 5. Model Development
80/20 split, `random_state=42`. Linear Regression (baseline), Decision Tree (`max_depth=12`), Random Forest (200 trees), each wrapped in `TransformedTargetRegressor`.

## 6. Model Evaluation
From `reports/results.csv` (test set, original rupees):

| Model | MAE | RMSE | R2 | Train R2 | CV R2 |
|---|---|---|---|---|---|
| Linear Regression | 123651.80 | 206714.01 | 0.6977 | 0.7113 | 0.6743 |
| Random Forest | 134891.82 | 231866.23 | 0.6196 | 0.9295 | 0.6715 |
| Decision Tree | 145742.40 | 268079.45 | 0.4915 | 0.8806 | 0.5367 |

## 7. Model Comparison
Linear Regression is deployed: best test R2 and MAE, train/test R2 aligned. Trees overfit (high train R2, weaker test R2). The PRD target of Random Forest R2 ≥ 0.85 is not met with this 8-column listing file (no engine, mileage or condition). Actual vs predicted and permutation importance: `reports/figures/actual_vs_predicted.png`, `feature_importance.png`.

## 8. Deployment
`streamlit run app.py` loads `models/best_model.pkl` and returns an estimated INR price for new input.
