# Memphis Energy Consumption Forecasting

**Competition Project** | 2025 Mathematical Modeling Challenge

A sophisticated time series forecasting system that predicts electricity consumption in Memphis, Tennessee by combining regional energy data with local weather patterns.

## What I Built

I developed a forecasting pipeline using advanced statistical models to predict long-term electricity demand. The system integrates multiple data sources—regional consumption data from the EIA, local utility records, and NOAA weather data—to generate accurate 20-year projections.

## Technical Approach

- Implemented two complementary forecasting models: **Exponential Smoothing** (Holt-Winters) and **SARIMAX**
- Engineered features from temperature data to capture weather-driven consumption patterns
- Built a data fusion pipeline to scale regional trends to local consumption levels
- Achieved **87.5% R² accuracy** with the SARIMAX model by incorporating temperature as an external predictor

## Key Results

The SARIMAX model outperformed baseline Exponential Smoothing across all metrics:
- **30.6% reduction** in Mean Squared Error
- **3.17% MAPE** for prediction accuracy
- Successfully captured seasonal patterns and weather-driven demand fluctuations

## Technologies

Python | Pandas | NumPy | Statsmodels | Scikit-learn | Matplotlib | Time Series Analysis

---

**Impact**: This forecasting system can help utilities optimize infrastructure planning, improve demand response strategies, and support data-driven policy decisions.