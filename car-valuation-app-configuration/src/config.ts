export const APP = {
  title: "AutoValuate AI",
  tagline: "Machine Learning Car Valuation Engine",
  currency: "INR",
  currencySymbol: "₹",
  apiBaseUrl: "http://127.0.0.1:8000",
};

export const BRANDS = [
  "Ambassador", "Audi", "Bmw", "Chevrolet", "Daewoo", "Datsun", "Fiat",
  "Force", "Ford", "Honda", "Hyundai", "Isuzu", "Jaguar", "Jeep", "Kia",
  "Land", "Mahindra", "Maruti", "Mercedes-Benz", "Mg", "Mitsubishi",
  "Nissan", "Opelcorsa", "Renault", "Skoda", "Tata", "Toyota",
  "Volkswagen", "Volvo",
] as const;

export const FUELS = ["Diesel", "Petrol", "CNG", "LPG", "Electric"] as const;
export const TRANSMISSIONS = ["Manual", "Automatic"] as const;
export const SELLER_TYPES = ["Individual", "Dealer", "Trustmark Dealer"] as const;
export const OWNERS = [
  "First Owner",
  "Second Owner",
  "Third Owner",
  "Fourth & Above Owner",
  "Test Drive Car",
] as const;

export const KM_PRESETS = [15000, 35000, 60000, 100000];

export const AGE_RANGE = { min: 0, max: 25, step: 1, default: 4 };
export const KM_RANGE = { min: 500, max: 200000, step: 1000, default: 35000 };

export type Brand = (typeof BRANDS)[number];
export type Fuel = (typeof FUELS)[number];
export type Transmission = (typeof TRANSMISSIONS)[number];
export type SellerType = (typeof SELLER_TYPES)[number];
export type Owner = (typeof OWNERS)[number];

export interface CarInput {
  brand: string;
  fuel: string;
  transmission: string;
  seller_type: string;
  owner: string;
  car_age: number;
  km_driven: number;
}

export const DEFAULT_INPUT: CarInput = {
  brand: "Hyundai",
  fuel: "Diesel",
  transmission: "Manual",
  seller_type: "Individual",
  owner: "First Owner",
  car_age: 4,
  km_driven: 35000,
};

export interface Insight {
  icon: string;
  title: string;
  description: string;
}

export interface PredictionResult {
  success: boolean;
  predicted_price: number;
  formatted_price: string;
  price_inr: string;
  range_low: number;
  range_high: number;
  range_low_formatted: string;
  range_high_formatted: string;
  range_text: string;
  depreciation_pct: number;
  km_per_year: number;
  best_model: string;
  market_demand: string;
  demand_score?: number;
  insights: Insight[];
  source?: "api" | "local";
}

export interface Benchmark {
  model: string;
  test_r2: number;
  cv_r2: number;
  mae: number;
  rmse: number;
  is_active: boolean;
}

export const BENCHMARKS: Benchmark[] = [
  { model: "Linear Regression", test_r2: 0.6978, cv_r2: 0.6737, mae: 123637.21, rmse: 206675.74, is_active: true },
  { model: "Ridge Regression", test_r2: 0.6833, cv_r2: 0.6882, mae: 125466.29, rmse: 211550.86, is_active: false },
  { model: "Gradient Boosting", test_r2: 0.6524, cv_r2: 0.6864, mae: 124831.51, rmse: 221655.93, is_active: false },
  { model: "Random Forest (Tuned)", test_r2: 0.5656, cv_r2: 0.6084, mae: 137840.02, rmse: 247765.86, is_active: false },
  { model: "Decision Tree", test_r2: 0.5405, cv_r2: 0.5844, mae: 139512.02, rmse: 254839.15, is_active: false },
];

export const FEATURE_WEIGHTS = [
  { feature: "Vehicle Age", weight: 0.31 },
  { feature: "Brand Tier", weight: 0.26 },
  { feature: "Kilometres Driven", weight: 0.17 },
  { feature: "Transmission", weight: 0.11 },
  { feature: "Fuel Type", weight: 0.09 },
  { feature: "Owner / Seller", weight: 0.06 },
];
