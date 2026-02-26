# 🚨 Chicago Crime Intelligence

Real-time crime analytics & predictive insights powered by ML and DSA.

## ⚡ Quick Start (Windows)

### Step 1 — First time only: Run SETUP.bat
Double-click `SETUP.bat` and wait for it to finish (~3 minutes).

### Step 2 — Every time: Run START.bat
Double-click `START.bat` — it opens two terminal windows (backend + frontend).

### Step 3 — Open browser
Go to: **http://localhost:5173**

---

## 📁 Project Structure

```
CrimeIntel/
├── SETUP.bat          ← Run ONCE to install everything
├── START.bat          ← Run EVERY TIME to start servers
├── backend/
│   ├── .env           ← Add your Socrata token here (optional)
│   ├── requirements.txt
│   └── app/
│       ├── main.py        → FastAPI entry point
│       ├── config.py      → Environment config
│       ├── dsa/
│       │   └── optimizer.py  → Binary Search, Min-Heap, Sliding Window, Prefix Sums
│       ├── ml/
│       │   └── risk_model.py → Ridge Regression risk scoring
│       ├── routes/        → API endpoints
│       ├── services/      → Data fetching & caching
│       ├── scheduler/     → Auto-sync every 10 min
│       └── utils/         → Helpers
└── frontend/
    ├── .env           ← Backend URL (already set)
    └── src/
        ├── App.jsx              → Main layout
        ├── components/
        │   ├── Hero.jsx         → Landing page
        │   ├── StatsCards.jsx   → 4 stat cards
        │   ├── FilterPanel.jsx  → Date/type/district filters
        │   ├── Charts.jsx       → Bar, Pie, Area, Risk charts
        │   ├── CrimeMap.jsx     → Leaflet interactive map
        │   └── RiskIntelligence.jsx → ML predictions
        ├── services/api.js      → Axios API calls
        └── hooks/useFetch.js    → Debounce hook
```

---

## 🧩 DSA Algorithms Used

| Algorithm | Location | Use Case | Complexity |
|-----------|----------|----------|------------|
| Binary Search | `dsa/optimizer.py` | Date range filtering | O(log n + k) |
| Min-Heap | `dsa/optimizer.py` | Top-k dangerous districts | O(n + d log k) |
| Sliding Window | `dsa/optimizer.py` | 7-day moving average | O(n) |
| Prefix Sums | `dsa/optimizer.py` | Range sum queries | O(1) query |
| Fixed Array [24] | `dsa/optimizer.py` | Peak hour detection | O(n) build |
| Z-Score | `dsa/optimizer.py` | Anomaly detection | O(n) |
| Hash Map Index | `services/data_service.py` | Dedup by case_number | O(1) lookup |

## 🤖 ML Model
- **Algorithm**: Ridge Regression (scikit-learn)
- **Features**: last 7 days, last 30 days, growth rate, violent crime ratio, peak hour factor
- **Output**: Risk score 0–100 per district + trend (increasing/stable/decreasing)
- **Retrains**: Every 24 hours automatically

---

## 🔑 Optional: Socrata API Token

Without a token it still works, but you may get rate-limited.

1. Go to https://data.cityofchicago.org/ → Sign Up → Create App Token
2. Open `backend/.env`
3. Set: `SOCRATA_APP_TOKEN=your_token_here`

---

## 🌐 API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/crimes?limit=100` | Latest crimes |
| GET | `/crimes/filter` | Filtered by type/district/date |
| GET | `/crimes/heatmap` | Map data |
| GET | `/stats/by-type` | Crime by type |
| GET | `/stats/top-dangerous?k=5` | Most dangerous districts |
| GET | `/stats/peak-hours` | Crime by hour |
| GET | `/stats/anomalies` | Z-score anomaly days |
| GET | `/ml/risk-scores` | All district risk scores |
| GET | `/ml/explain/{district}` | Feature explanation |

API docs at: http://localhost:8000/docs

