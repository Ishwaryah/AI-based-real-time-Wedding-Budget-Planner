# 💍 Shaadi.AI — AI-Powered Wedding Planner

> Hackathon-ready full-stack wedding planning platform with AI decor cost prediction, PSO budget optimizer, and beautiful UI.

## ✨ Features

| Tab | Feature |
|-----|---------|
| 💒 Style | Wedding type, date (weekend +15%), events selector |
| 🏛️ Venue | Venue type, city, guests, accommodation auto-calculator |
| 🎨 Decor AI | **ML cost predictor** (MobileNetV2 + RandomForest), similarity search |
| 🍽️ Food | Food tiers, bar type, specialty counters, live estimate |
| 🎤 Artists | Named artist selector with fee ranges |
| 🧺 Sundries | Auto-calculated room baskets, hampers, rituals |
| 🚐 Logistics | Fleet calculator, Ghodi, Dholi, SFX |
| 💰 Budget | **PSO Optimizer**, pie chart, itemised table, PDF/JSON export |

## 🚀 Quick Start (One Command)

### Windows
```
Double-click: START_WINDOWS.bat
```

### Mac / Linux
```bash
chmod +x start_mac_linux.sh
./start_mac_linux.sh
```

Both scripts will:
1. ✅ Check Node.js + Python
2. 📦 Install all packages
3. 🤖 Train the AI model
4. 🚀 Launch backend + frontend
5. 🌐 Open browser automatically

## 📋 Prerequisites

- **Node.js** v18+ → https://nodejs.org (click "LTS")
- **Python** 3.10+ → https://python.org
  - ⚠️ Windows: Check "Add Python to PATH" during install!

## 🏗️ Architecture

```
shaadi-ai/
├── frontend/              # React + Vite
│   └── src/
│       ├── App.jsx           # Main app + navigation
│       ├── context/          # Global wedding state
│       ├── pages/            # All 8 tabs
│       └── components/       # Reusable ImageCard
│
├── backend/               # FastAPI (Python)
│   ├── main.py              # App entry point
│   ├── models/cost_tables.py # All cost data (admin-editable)
│   ├── services/budget_engine.py  # Budget + PSO
│   ├── routers/             # API endpoints
│   └── ml/
│       └── train.py         # ML pipeline (MobileNetV2 + RF)
│
├── START_WINDOWS.bat      # One-click Windows launcher
└── start_mac_linux.sh     # One-click Mac/Linux launcher
```

## 🤖 AI Features

### Decor Cost Predictor (Tab 3)
- **Model**: RandomForestRegressor
- **Features**: MobileNetV2 image embeddings (1280-dim) + one-hot tags
- **Training**: ~200 augmented samples (expandable to 10,000+)
- **Output**: Predicted cost + ±20% range + top-3 similar designs
- **Similarity**: Cosine similarity on image embeddings

### PSO Budget Optimizer (Tab 8)
- **Algorithm**: Particle Swarm Optimization
- **Particles**: 30 particles × 50 iterations
- **Levers**: Venue, Food, Hotel, Decor, Artists, Logistics tiers
- **Output**: Itemised recommendations to hit target budget

## 💰 Budget Engine

All costs are rule-based and admin-configurable in `backend/models/cost_tables.py`:
- Wedding type base costs (7 types × 3 tiers)
- Per-event costs (7 events)
- Venue costs per day (9 venue types)
- Accommodation (5 hotel tiers with PPR)
- Food per-head + bar + specialty counters
- Artist fee ranges (10 artist types)
- Logistics (fleet, Ghodi, Dholi, SFX)

## 🔧 Manual Start (if scripts fail)

**Terminal 1 — Backend:**
```bash
cd backend
pip install fastapi uvicorn scikit-learn numpy pillow
python -m uvicorn main:app --reload --port 8000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm install
npm run dev
```

Open: http://localhost:3000

## 🎯 Hackathon Tips

- The **AI Decor predictor** and **PSO optimizer** are the 2 biggest wow moments
- The **live budget bar** at the top updates as you fill tabs
- Works offline (budget engine has a local fallback if backend is down)
- All cost tables can be live-edited in `cost_tables.py` during the demo

---
Built with ❤️ for hackathon by Shaadi.AI
