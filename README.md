# Sustainable Smart City AI Assistant – Government Official Portal

A secure, enterprise-grade municipal administration and smart city command center portal built for government officials to monitor urban sustainability, handle citizen municipal complaints, analyze real-time environmental telemetry, detect infrastructure anomalies, and support data-driven municipal decisions.

---

## 🏛️ System Architecture

```
Sustainable_SmartCity_AI/
├── backend/                        # FastAPI REST API Backend
│   ├── app/
│   │   ├── core/                   # Security, DB session, JWT, Dependencies, RBAC
│   │   ├── models/                 # SQLAlchemy ORM models (PostgreSQL)
│   │   ├── schemas/                # Pydantic request & response schemas
│   │   ├── routers/                # 11 REST Router modules
│   │   ├── services/               # Core business logic layer
│   │   ├── repositories/           # Repository pattern data access
│   │   ├── ml/                     # Scikit-learn Random Forest & Isolation Forest
│   │   ├── utils/                  # Seed dataset generator (365 days of data)
│   │   └── main.py                 # FastAPI application factory & CORS
│   ├── migrations/                 # Alembic DB migrations
│   ├── tests/                      # Pytest unit & authorization test suite
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/                       # React 18 + Vite SPA
│   ├── src/
│   │   ├── components/ui/          # Button, Table, Modal, Badge, Pagination, etc.
│   │   ├── components/charts/      # Recharts visualizations
│   │   ├── layouts/                # Enterprise Command Center Sidebar & TopNav
│   │   ├── pages/                  # 14 Role-guarded portal views
│   │   ├── services/               # Axios API client services
│   │   ├── context/                # AuthContext & NotificationContext
│   │   └── routes/                 # ProtectedRoute & RoleGuard
│   ├── Dockerfile
│   └── package.json
└── docker-compose.yml              # Complete 1-command containerized stack
```

---

## 👥 Role-Based Access Control (RBAC)

The portal strictly enforces authorization across 4 distinct official tiers:

| Role | Dashboard | Complaints | Departments | Analytics & Export | ML Predictions | Documents | User Admin |
|---|---|---|---|---|---|---|---|
| **SUPER_ADMIN** | Full Access | All & Assign | Create & Edit | View & Seed | View & Train | View, Upload, Delete | Full CRUD |
| **CITY_ADMIN** | City-Wide | All & Assign | View & Edit | View & Export | View Only | View & Upload | No Access |
| **DEPARTMENT_OFFICER** | Department | Assigned Dept | View Dept | Restricted | Restricted | View Only | No Access |
| **DATA_ANALYST** | Telemetry | Read-Only | Read-Only | Full & Export | View & Train | View Only | No Access |

---

## ⚡ Default Pre-seeded Official Credentials

When initialized with seed data, the following official demonstration accounts are created:

| Role | Email | Password | Assigned Department |
|---|---|---|---|
| **SUPER_ADMIN** | `super_admin@smartcity.gov` | `Admin@123456` | Global Jurisdiction |
| **CITY_ADMIN** | `city_admin@smartcity.gov` | `CityAdmin@123` | Global Jurisdiction |
| **DEPARTMENT_OFFICER** | `officer@smartcity.gov` | `Officer@123` | Waste Management (WM) |
| **DATA_ANALYST** | `analyst@smartcity.gov` | `Analyst@123` | Global Analytics |

---

## 🚀 Quickstart & Execution Guide

### Option A: Docker Compose (Recommended)

Run the entire stack with PostgreSQL, FastAPI backend, and React frontend with a single command:

```bash
docker-compose up --build
```

- **Frontend Portal**: `http://localhost:5173`
- **Backend API & Swagger Docs**: `http://localhost:8000/docs`
- **PostgreSQL Database**: `localhost:5432`

---

### Option B: Local Development Execution

#### 1. Backend Setup

```bash
cd backend

# Create & activate Python virtual environment
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env

# Run database migrations
alembic upgrade head

# Seed realistic 365-day dataset and demo accounts
python -c "from app.utils.seed_data import seed_initial_data; from app.core.database import SessionLocal; db = SessionLocal(); seed_initial_data(db); db.close()"

# Start FastAPI server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Backend Swagger interactive documentation is accessible at:
👉 **`http://localhost:8000/docs`**

#### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```

Frontend Command Center is accessible at:
👉 **`http://localhost:5173`**

---

## 🧠 Machine Learning & AI Readiness

1. **Urban Anomaly Detection (Isolation Forest)**
   - Unsupervised outlier detection using Scikit-learn `IsolationForest`
   - Scans 90-day multi-variate telemetry (water, electricity, waste, AQI) to flag deviations beyond baseline confidence intervals.
2. **City Trajectory Forecasting (Random Forest)**
   - Regressor models trained on calendar time features (`day_of_week`, `month`, `day_of_month`, `week_of_year`)
   - Interactive model retraining directly from the Official UI.
3. **IBM Granite Architecture**
   - Document upload schema and recommendation services include dedicated reserved fields (`ai_summary`, `ai_summary_status`, `generated_by`) ready for retrieval-augmented generation (RAG) and document analysis with IBM Granite in the subsequent project phase.

