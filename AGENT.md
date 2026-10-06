# AGENT.md

Instructions for any AI coding agent (Claude Code, Cursor, Copilot, etc.) working in this repository.
Read `PRD.md` first. It is the source of truth for scope and requirements.

## Project
Used Car Price Prediction: a regression mini project for a Machine Learning course (BE Computer Engineering). Predict `selling_price` of a used car from its attributes, compare Linear Regression, Decision Tree and Random Forest, and demo the best model in Streamlit.

## Repository Layout
```
car-price-prediction/
├── PRD.md                  # requirements (read first)
├── AGENT.md                # this file
├── README.md               # how to run
├── requirements.txt
├── app.py                  # Streamlit demo
├── data/car_data.csv       # dataset (user provides, not committed if large)
├── src/train.py            # full pipeline: clean -> split -> train -> evaluate -> save
├── notebooks/car_price_prediction.ipynb   # submission notebook (8 components)
├── models/                 # best_model.pkl, meta.json (generated)
└── reports/                # results.csv, figures/ (generated)
```

## Commands
```bash
pip install -r requirements.txt
python src/train.py --data data/car_data.csv    # trains, evaluates, saves model + reports
streamlit run app.py                            # launches demo
```

## Conventions
- Python 3.10+, PEP 8, type hints where cheap.
- Random seed is always `42`.
- Column names live in constants at the top of `src/train.py`. If the dataset differs, change them there, not in scattered places.
- All preprocessing (imputation, encoding, scaling) lives **inside the sklearn Pipeline**. Never fit a scaler or encoder on the full dataset before splitting (data leakage).
- Train on `log1p(price)` via `TransformedTargetRegressor`; always report metrics in original rupees.
- Plots are saved to `reports/figures/` as PNG, with titles and axis labels.
- Keep notebook markdown headings aligned with the 8 department components so the evaluator can map them directly.

## Rules
1. **Do not** change the target variable, the train/test split ratio or the random seed without being asked.
2. **Do not** use deep learning or add heavy dependencies. Scope is classical ML (scikit-learn).
3. **Do not** hard-code absolute paths. Use `pathlib` and paths relative to the repo root.
4. **Do not** commit large datasets or generated model files.
5. Every modelling claim in the report must be backed by a number in `reports/results.csv`.
6. If a column or dataset assumption turns out wrong, stop and ask rather than guessing silently.

## Definition of Done
- [ ] `python src/train.py` runs end to end with no errors
- [ ] `reports/results.csv` has MAE, MSE, RMSE, R2 for all three models
- [ ] Actual vs Predicted plot and feature importance saved
- [ ] Notebook runs top to bottom and has an interpretation line under every plot
- [ ] `streamlit run app.py` returns a price for new input
- [ ] README explains setup in under 10 lines

## Common Tasks for the Agent
| Task | Where |
|---|---|
| Adapt to a different dataset | Constants at top of `src/train.py`, form fields in `app.py` |
| Add a model (e.g. Gradient Boosting) | `get_models()` in `src/train.py` |
| Add hyperparameter tuning | New function using `RandomizedSearchCV` on the Random Forest pipeline |
| Add cross-validation | `cross_val_score` on the pipeline, report mean and std of R2 |
| Improve UI | `app.py` only |

## Out of Scope
Live data scraping, user accounts, databases, cloud deployment.
