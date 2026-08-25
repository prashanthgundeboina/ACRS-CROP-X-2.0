export interface DatasetRow {
  n: number; p: number; k: number;
  temp: number; hum: number; ph: number; rain: number;
  moist: number; type: number; sun: number; wind: number;
  co2: number; organic: number; irr: number; density: number;
  pest: number; fert: number; growth: number; urban: number;
  water: number; frost: number; eff: number;
  label: string;
}

export const CROP_DATASET: DatasetRow[] = [
  { n: 90, p: 42, k: 43, temp: 20.87, hum: 82.00, ph: 6.50, rain: 202.93, label: "rice", moist: 29.44, type: 2, sun: 8.67, wind: 10.10, co2: 435.61, organic: 3.12, irr: 4, density: 11.74, pest: 57.60, fert: 188.19, growth: 1, urban: 2.71, water: 3, frost: 95.64, eff: 1.19 },
  { n: 85, p: 58, k: 41, temp: 21.77, hum: 80.31, ph: 7.03, rain: 226.65, label: "rice", moist: 12.85, type: 3, sun: 5.75, wind: 12.04, co2: 401.45, organic: 2.14, irr: 4, density: 16.79, pest: 74.73, fert: 70.96, growth: 1, urban: 4.71, water: 2, frost: 77.26, eff: 1.75 },
  { n: 60, p: 55, k: 44, temp: 23.00, hum: 82.32, ph: 7.84, rain: 263.96, label: "rice", moist: 29.36, type: 2, sun: 9.87, wind: 9.05, co2: 357.41, organic: 1.47, irr: 1, density: 12.65, pest: 1.03, fert: 191.97, growth: 1, urban: 30.43, water: 2, frost: 18.19, eff: 3.03 },
  { n: 71, p: 54, k: 16, temp: 22.61, hum: 63.69, ph: 5.74, rain: 87.75, label: "maize", moist: 28.15, type: 1, sun: 10.45, wind: 14.63, co2: 418.12, organic: 8.56, irr: 1, density: 17.40, pest: 91.21, fert: 162.70, growth: 2, urban: 15.25, water: 2, frost: 61.72, eff: 3.79 },
  { n: 61, p: 44, k: 17, temp: 26.10, hum: 71.57, ph: 6.93, rain: 102.26, label: "maize", moist: 20.07, type: 1, sun: 10.28, wind: 12.84, co2: 365.48, organic: 8.45, irr: 1, density: 14.25, pest: 15.84, fert: 60.31, growth: 1, urban: 31.10, water: 2, frost: 6.80, eff: 3.00 },
  { n: 31, p: 70, k: 77, temp: 20.88, hum: 14.32, ph: 6.49, rain: 90.46, label: "chickpea", moist: 26.23, type: 1, sun: 6.77, wind: 2.42, co2: 360.01, organic: 8.59, irr: 6, density: 19.87, pest: 94.37, fert: 133.98, growth: 3, urban: 24.05, water: 3, frost: 3.02, eff: 3.55 },
  { n: 26, p: 80, k: 83, temp: 17.08, hum: 16.14, ph: 7.52, rain: 71.31, label: "chickpea", moist: 21.29, type: 1, sun: 11.45, wind: 9.41, co2: 449.15, organic: 5.54, irr: 6, density: 17.46, pest: 91.76, fert: 148.44, growth: 2, urban: 25.57, water: 3, frost: 48.01, eff: 4.15 },
  { n: 13, p: 144, k: 204, temp: 30.72, hum: 82.42, ph: 6.09, rain: 68.38, label: "grapes", moist: 16.49, type: 2, sun: 5.20, wind: 14.56, co2: 429.00, organic: 2.74, irr: 1, density: 18.55, pest: 85.66, fert: 196.70, growth: 1, urban: 20.61, water: 1, frost: 14.31, eff: 1.13 },
  { n: 22, p: 123, k: 205, temp: 32.44, hum: 83.88, ph: 5.89, rain: 68.73, label: "grapes", moist: 22.16, type: 3, sun: 6.44, wind: 15.52, co2: 432.89, organic: 6.43, irr: 4, density: 9.20, pest: 18.96, fert: 172.97, growth: 2, urban: 25.75, water: 3, frost: 82.09, eff: 4.93 },
  { n: 105, p: 95, k: 50, temp: 27.33, hum: 83.67, ph: 5.84, rain: 101.04, label: "banana", moist: 23.03, type: 2, sun: 10.56, wind: 0.80, co2: 430.11, organic: 7.27, irr: 1, density: 7.14, pest: 73.37, fert: 77.51, growth: 1, urban: 31.90, water: 3, frost: 15.53, eff: 1.32 },
  { n: 108, p: 92, k: 53, temp: 27.40, hum: 82.96, ph: 6.27, rain: 104.93, label: "banana", moist: 12.52, type: 1, sun: 9.88, wind: 15.01, co2: 431.56, organic: 2.38, irr: 4, density: 12.75, pest: 3.85, fert: 129.51, growth: 2, urban: 47.38, water: 1, frost: 86.85, eff: 4.25 },
  { n: 133, p: 47, k: 24, temp: 24.40, hum: 79.19, ph: 7.23, rain: 90.80, label: "cotton", moist: 28.15, type: 3, sun: 11.95, wind: 11.08, co2: 392.08, organic: 4.69, irr: 1, density: 12.09, pest: 85.40, fert: 109.26, growth: 3, urban: 38.46, water: 3, frost: 68.02, eff: 1.43 },
  { n: 104, p: 47, k: 18, temp: 23.96, hum: 76.97, ph: 7.63, rain: 90.75, label: "cotton", moist: 27.74, type: 1, sun: 8.74, wind: 15.60, co2: 350.36, organic: 3.87, irr: 4, density: 17.56, pest: 71.64, fert: 104.12, growth: 1, urban: 0.77, water: 1, frost: 79.10, eff: 3.67 },
  { n: 13, p: 60, k: 25, temp: 17.13, hum: 20.59, ph: 5.68, rain: 128.25, label: "kidneybeans", moist: 27.51, type: 1, sun: 9.51, wind: 5.07, co2: 426.67, organic: 8.67, irr: 2, density: 12.05, pest: 69.17, fert: 111.48, growth: 1, urban: 22.48, water: 3, frost: 0.88, eff: 3.64 }
];
