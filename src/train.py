"""Used Car Price Prediction: full training pipeline.

Usage:
    python src/train.py --data data/car_data.csv
"""
import argparse
import json
from pathlib import Path

import joblib
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import seaborn as sns
from sklearn.compose import ColumnTransformer, TransformedTargetRegressor
from sklearn.ensemble import GradientBoostingRegressor, RandomForestRegressor
from sklearn.linear_model import LinearRegression, Ridge
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.inspection import permutation_importance
from sklearn.model_selection import cross_val_score, train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.tree import DecisionTreeRegressor

# ---------------------------------------------------------------------------
# Dataset configuration: change ONLY here if your dataset differs
# ---------------------------------------------------------------------------
ROOT = Path(__file__).resolve().parents[1]
CURRENT_YEAR = 2026
SEED = 42
TARGET = "selling_price"
NAME_COL = "name"            # used to extract brand (set to None if absent)
YEAR_COL = "year"            # converted to car_age
NUMERIC_COLS = ["km_driven", "car_age", "km_per_year"]
CATEGORICAL_COLS = ["brand", "fuel", "seller_type", "transmission", "owner"]


# ---------------------------------------------------------------------------
# 1-3. Load, clean, feature engineering
# ---------------------------------------------------------------------------
def load_and_clean(path: Path) -> pd.DataFrame:
    df = pd.read_csv(path)
    print(f"Raw shape: {df.shape}")
    print("Missing values:\n", df.isnull().sum()[df.isnull().sum() > 0])

    df = df.drop_duplicates().dropna().copy()

    if NAME_COL and NAME_COL in df.columns:
        df["brand"] = df[NAME_COL].astype(str).str.split().str[0].str.title()
        df = df.drop(columns=[NAME_COL])
    df["car_age"] = CURRENT_YEAR - df[YEAR_COL]
    df = df.drop(columns=[YEAR_COL])
    df["km_per_year"] = (df["km_driven"] / df["car_age"].clip(lower=1)).round(2)

    # Outliers: drop impossible values and cap extreme tails (top 1%)
    df = df[(df[TARGET] > 0) & (df["km_driven"] >= 0) & (df["car_age"] >= 0)]
    for col in [TARGET, "km_driven"]:
        df = df[df[col] <= df[col].quantile(0.99)]

    print(f"Clean shape: {df.shape}")
    return df.reset_index(drop=True)


def build_preprocessor() -> ColumnTransformer:
    return ColumnTransformer([
        ("num", StandardScaler(), NUMERIC_COLS),
        ("cat", OneHotEncoder(handle_unknown="ignore"), CATEGORICAL_COLS),
    ])


# ---------------------------------------------------------------------------
# 5. Models (with Hyperparameter Tuning & Ensemble Boosting)
# ---------------------------------------------------------------------------
def get_models() -> dict:
    regressors = {
        "Linear Regression": LinearRegression(),
        "Ridge Regression": Ridge(alpha=1.0, random_state=SEED),
        "Decision Tree": DecisionTreeRegressor(
            max_depth=8, min_samples_split=10, min_samples_leaf=4, random_state=SEED
        ),
        "Random Forest (Tuned)": RandomForestRegressor(
            n_estimators=300,
            max_depth=14,
            min_samples_split=6,
            min_samples_leaf=2,
            max_features="sqrt",
            n_jobs=-1,
            random_state=SEED,
        ),
        "Gradient Boosting": GradientBoostingRegressor(
            n_estimators=300,
            learning_rate=0.06,
            max_depth=5,
            min_samples_split=6,
            min_samples_leaf=3,
            subsample=0.85,
            random_state=SEED,
        ),
    }
    models = {}
    for name, reg in regressors.items():
        pipe = Pipeline([("prep", build_preprocessor()), ("model", reg)])
        models[name] = TransformedTargetRegressor(
            regressor=pipe, func=np.log1p, inverse_func=np.expm1
        )
    return models


# ---------------------------------------------------------------------------
# 6. Evaluation
# ---------------------------------------------------------------------------
def evaluate(model, X_train, X_test, y_train, y_test) -> dict:
    pred = model.predict(X_test)
    mse = mean_squared_error(y_test, pred)
    return {
        "MAE": mean_absolute_error(y_test, pred),
        "MSE": mse,
        "RMSE": float(np.sqrt(mse)),
        "R2": r2_score(y_test, pred),
        "Train R2": r2_score(y_train, model.predict(X_train)),
    }


def save_plots(best_name, best_model, X_test, y_test, fig_dir: Path) -> None:
    fig_dir.mkdir(parents=True, exist_ok=True)

    pred = best_model.predict(X_test)
    plt.figure(figsize=(6, 6))
    plt.scatter(y_test, pred, alpha=0.4, color="#3b82f6")
    lim = [0, max(y_test.max(), pred.max())]
    plt.plot(lim, lim, "r--", label="Perfect prediction")
    plt.xlabel("Actual price (INR)")
    plt.ylabel("Predicted price (INR)")
    plt.title(f"Actual vs Predicted ({best_name})")
    plt.legend()
    plt.tight_layout()
    plt.savefig(fig_dir / "actual_vs_predicted.png", dpi=150)
    plt.close()

    perm = permutation_importance(
        best_model, X_test, y_test, n_repeats=10, random_state=SEED, n_jobs=-1
    )
    imp = pd.Series(perm.importances_mean, index=X_test.columns).sort_values()
    plt.figure(figsize=(7, 5))
    sns.barplot(x=imp.values, y=imp.index, palette="viridis")
    plt.title(f"Permutation importance ({best_name})")
    plt.xlabel("Mean R2 decrease")
    plt.tight_layout()
    plt.savefig(fig_dir / "feature_importance.png", dpi=150)
    plt.close()


def save_eda_plots(df: pd.DataFrame, fig_dir: Path) -> None:
    fig_dir.mkdir(parents=True, exist_ok=True)
    sns.histplot(df[TARGET], kde=True, color="#10b981")
    plt.title("Distribution of selling price")
    plt.xlabel("Selling price (INR)")
    plt.ylabel("Count")
    plt.savefig(fig_dir / "price_distribution.png", dpi=150, bbox_inches="tight")
    plt.close()

    sns.scatterplot(x="km_driven", y=TARGET, data=df, alpha=0.4, color="#6366f1")
    plt.title("Price vs kilometres driven")
    plt.xlabel("Kilometres driven")
    plt.ylabel("Selling price (INR)")
    plt.savefig(fig_dir / "price_vs_km.png", dpi=150, bbox_inches="tight")
    plt.close()

    sns.scatterplot(x="car_age", y=TARGET, data=df, alpha=0.4, color="#f59e0b")
    plt.title("Price vs car age")
    plt.xlabel("Car age (years)")
    plt.ylabel("Selling price (INR)")
    plt.savefig(fig_dir / "price_vs_age.png", dpi=150, bbox_inches="tight")
    plt.close()

    plt.figure(figsize=(6, 5))
    num_cols_for_corr = [c for c in NUMERIC_COLS + [TARGET] if c in df.columns]
    sns.heatmap(df[num_cols_for_corr].corr(), annot=True, cmap="coolwarm", fmt=".2f")
    plt.title("Correlation heatmap")
    plt.savefig(fig_dir / "correlation_heatmap.png", dpi=150, bbox_inches="tight")
    plt.close()


# ---------------------------------------------------------------------------
def main(data_path: Path) -> None:
    df = load_and_clean(data_path)
    save_eda_plots(df, ROOT / "reports" / "figures")

    X = df[NUMERIC_COLS + CATEGORICAL_COLS]
    y = df[TARGET]
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=SEED
    )

    rows, fitted = [], {}
    for name, model in get_models().items():
        print(f"Training {name}...")
        model.fit(X_train, y_train)
        fitted[name] = model
        metrics = evaluate(model, X_train, X_test, y_train, y_test)
        cv = cross_val_score(model, X_train, y_train, cv=5, scoring="r2")
        metrics["CV R2 (mean)"] = cv.mean()
        rows.append({"Model": name, **metrics})

    results = pd.DataFrame(rows).round(4).sort_values("R2", ascending=False)
    print("\n=== Model comparison ===")
    print(results.to_string(index=False))

    out_dir = ROOT / "reports"
    out_dir.mkdir(exist_ok=True)
    results.to_csv(out_dir / "results.csv", index=False)

    best_name = results.iloc[0]["Model"]
    best_model = fitted[best_name]
    save_plots(best_name, best_model, X_test, y_test, out_dir / "figures")

    model_dir = ROOT / "models"
    model_dir.mkdir(exist_ok=True)
    joblib.dump(best_model, model_dir / "best_model.pkl")
    
    # Feature importance extraction if available
    feature_importances = {}
    try:
        perm = permutation_importance(
            best_model, X_test, y_test, n_repeats=5, random_state=SEED, n_jobs=-1
        )
        for col, val in zip(X_test.columns, perm.importances_mean):
            feature_importances[col] = round(float(val), 4)
    except Exception as e:
        print(f"Feature importance error: {e}")

    meta = {
        "best_model": best_name,
        "numeric": NUMERIC_COLS,
        "categorical": CATEGORICAL_COLS,
        "choices": {c: sorted(df[c].astype(str).unique().tolist()) for c in CATEGORICAL_COLS},
        "ranges": {
            "km_driven": [0, int(df["km_driven"].max())],
            "car_age": [0, int(df["car_age"].max())],
            "km_per_year": [0, int(df["km_per_year"].max())],
        },
        "feature_importances": feature_importances,
    }
    (model_dir / "meta.json").write_text(json.dumps(meta, indent=2))
    print(f"\nBest model: {best_name}. Saved to models/best_model.pkl")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--data", type=Path, default=ROOT / "data" / "car_data.csv")
    args = parser.parse_args()
    main(args.data)
