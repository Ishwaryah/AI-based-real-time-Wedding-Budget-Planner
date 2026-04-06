# WeddingBudget.AI
AI-powered Indian wedding budget estimator

## Live URLs
- Frontend: https://wedddingbudget-ai.vercel.app
- Backend: https://wedddingbudget-ai.onrender.com
- API Docs: https://wedddingbudget-ai.onrender.com/docs
- Admin: https://wedddingbudget-ai.vercel.app/admin

## Tech Stack
| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + Framer Motion |
| Backend | FastAPI + Python 3.11 |
| Database | PostgreSQL + SQLAlchemy |
| ML | GradientBoosting + MobileNetV2 + PSO + RL |
| Deployment | Vercel + Render |

## Modules Built
| Module | Status |
|---|---|
| Smart Input Wizard (8 tabs) | ✅ |
| Decor Intelligence Library | ✅ |
| Logistics Cost Engine | ✅ |
| Artist Cost Mapper | ✅ |
| F&B Budget Module | ✅ |
| Sundries & Basics | ✅ |
| Budget Output + Export | ✅ |
| Admin Panel + Labelling UI | ✅ |
| Scraping Pipeline (10000+ scapper images) | ✅ |
| RL Self-Learning Agent | ✅ |
| Budget Rules Editor | ✅ |
| Model Status Dashboard | ✅ |
| Budget Tracker (Admin) | ✅ |
| WhatsApp Sharing | ✅ |

## Architecture
User Browser
↓
React Frontend (Vercel)
↓ REST API
FastAPI Backend (Render)
↓
PostgreSQL Database
↓
ML Pipeline:
├── Decor AI (MobileNetV2 + GradientBoosting)
├── PSO Optimizer (30 particles × 50 iterations)
└── RL Agent (Multi-Armed Bandit ε=0.15)

## All API Endpoints
POST /api/budget/calculate
POST /api/budget/scenarios
POST /api/budget/optimize
POST /api/budget/log-actual
POST /api/budget/optimize
POST /api/budget/finalise
GET  /api/budget/rl-stats
GET  /api/budget/tracker-summary
GET  /api/decor/library
POST /api/decor/predict
POST /api/decor/predict-upload
POST /api/admin/login
GET/POST/PUT/DELETE /api/admin/artists
GET/PUT /api/admin/fb-rates
GET/POST/PUT/DELETE /api/admin/logistics/{city}
GET/PUT /api/admin/contingency
GET/PUT /api/admin/budget-rules
GET /api/admin/model-status
GET /api/admin/decor-images
POST /api/admin/decor/retrain
GET /api/health

## Local Setup
```bash
# Backend
cd backend
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m uvicorn main:app --port 8000

# Frontend
cd frontend
npm install
npm run dev
```

## Environment Variables
DATABASE_URL=postgresql+asyncpg://...
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=...
VITE_API_URL=https://wedddingbudget-ai.onrender.com/api
PYTHON_VERSION=3.11.0

## Admin Credentials
URL: /admin
Username: admin
Password: shaadi@admin2026

## Innovation Highlights
- RL Agent learns from real vendor invoices
- MobileNetV2 image embeddings for decor cost prediction
- PSO optimizer finds optimal budget allocation
- Auto-labelling pipeline for 299 decor images
- Admin-controlled budget rules and multipliers
- WhatsApp budget sharing for client presentations
