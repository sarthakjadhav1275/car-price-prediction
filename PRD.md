# PRD: Used Car Price Prediction System

**Course:** Machine Learning Mini Project | BE B, Computer Engineering | A.Y. 2026-27
**Group:** B5 (CSD 47, 48, 49, 50)
**Level:** Basic
**Problem type:** Supervised learning, Regression

---

## 1. Problem Definition
Estimating a fair resale price for a used car is difficult because price depends on many interacting factors: age, kilometres driven, fuel type, transmission, ownership history and brand. Buyers risk overpaying and sellers risk underpricing.

**Objective:** Build an ML system that predicts the resale price of a used car from its attributes, compare at least two regression algorithms, and expose the best model through a simple web interface.

## 2. Goals and Non-Goals
**Goals**
- Complete the full ML workflow required by the department (8 components, see section 6).
- Compare Linear Regression, Decision Tree and Random Forest with a clear results table.
- Provide a working prediction demo for new input (Streamlit).

**Non-Goals**
- Deep learning, scraping live listings, or production-grade deployment.
- Predicting for car models/brands absent from the dataset.

## 3. Users
| User | Need |
|---|---|
| Car buyer | Check if an asking price is fair |
| Car seller | Pick a realistic listing price |
| Evaluator | See complete, reproducible ML workflow |

## 4. Dataset
- **Source (pick one, record the choice here):** Kaggle "CarDekho Vehicle Dataset" (`name, year, selling_price, km_driven, fuel, seller_type, transmission, owner`).
- **Target variable:** `selling_price`
- **Records / attributes:** 4340 rows × 8 columns raw; 3506 rows after dropping duplicates, invalid values and the top 1% price/km tails.
- **File location:** `data/car_data.csv`

## 5. Functional Requirements
| ID | Requirement | Priority |
|---|---|---|
| FR1 | Load dataset and print shape, dtypes, summary statistics | Must |
| FR2 | Handle missing values, duplicates, outliers | Must |
| FR3 | Encode categorical features and scale numeric ones | Must |
| FR4 | Derive `car_age` from `year`, and `brand` from `name` | Must |
| FR5 | Univariate, bivariate and correlation EDA with interpretation | Must |
| FR6 | 80/20 train-test split with fixed random seed | Must |
| FR7 | Train Linear Regression, Decision Tree, Random Forest | Must |
| FR8 | Evaluate with MAE, MSE, RMSE, R2 | Must |
| FR9 | Results comparison table plus discussion | Must |
| FR10 | Actual vs Predicted plot and feature importance | Should |
| FR11 | Streamlit app that predicts price for new input | Should |
| FR12 | Hyperparameter tuning (GridSearchCV/RandomizedSearchCV) | Could |
| FR13 | Cross-validation scores | Could |

## 6. Mapping to the Department Structure
| # | Component | Deliverable | Location |
|---|---|---|---|
| 1 | Problem Definition | Section 1 of this PRD and report | `PRD.md`, report |
| 2 | Dataset | Source, records, attributes, target, column descriptions | notebook section 2 |
| 3 | Data Preprocessing | Missing values, duplicates, encoding, scaling, outliers | `src/train.py`, notebook |
| 4 | EDA | Univariate, bivariate, correlation plots with insights | notebook, `reports/figures/` |
| 5 | Model Development | 3 models, justification of each | `src/train.py` |
| 6 | Model Evaluation | MAE, MSE, RMSE, R2 | `reports/results.csv` |
| 7 | Model Comparison | Results table and discussion | notebook, report |
| 8 | Deployment / Demo | Streamlit interface | `app.py` |

## 7. Modelling Approach
- **Features:** `brand, car_age, km_driven, fuel, seller_type, transmission, owner` (adapt to the chosen dataset).
- **Target transform:** `log1p(selling_price)` during training, inverted for reporting (prices are right-skewed).
- **Preprocessing:** `ColumnTransformer` (StandardScaler on numeric, OneHotEncoder on categorical), wrapped in a single `Pipeline` so the saved model accepts raw input.
- **Algorithms and rationale:**
  - Linear Regression: interpretable baseline.
  - Decision Tree: captures non-linear splits, easy to explain.
  - Random Forest: ensemble that reduces variance, expected best performer.

## 8. Evaluation Metrics
| Metric | Meaning |
|---|---|
| MAE | Average absolute error in rupees |
| MSE | Average squared error, penalises large mistakes |
| RMSE | Square root of MSE, same unit as price |
| R2 | Share of price variance explained (closer to 1 is better) |

**Success criteria:** Random Forest R2 of at least 0.85 on the test set (adjust after seeing the dataset), and all three models compared in a single table.

## 9. Deliverables
1. Jupyter/Colab notebook following the 8-component structure
2. `src/train.py`, which reproduces results end to end
3. Streamlit app (`app.py`)
4. Project report and PPT mirroring section 6
5. GitHub repository with README

## 10. Milestones
| Phase | Tasks | Owner |
|---|---|---|
| 1 | Pick dataset, define problem, load data | Member 1 |
| 2 | Preprocessing pipeline | Member 1 |
| 3 | EDA and visualisations | Member 2 |
| 4 | Train models and tune | Member 3 |
| 5 | Evaluate, compare, write discussion | Member 4 |
| 6 | Streamlit demo | Member 4 |
| 7 | Report and PPT | All |

## 11. Risks
| Risk | Mitigation |
|---|---|
| Skewed price distribution hurts Linear Regression | Log-transform the target |
| High-cardinality `name` column | Use `brand` only |
| Unseen category at prediction time | `OneHotEncoder(handle_unknown="ignore")` |
| Data leakage | Fit all preprocessing inside the Pipeline, after the split |
| Overfitting (Decision Tree) | Compare train vs test scores, limit depth |

## 12. Open Questions
- Dataset finalised: Kaggle CarDekho `CAR DETAILS FROM CAR DEKHO.csv` (8 columns listed in section 4).
- Scope kept at Basic: no GridSearchCV; 5-fold CV R2 is reported for comparison only.
