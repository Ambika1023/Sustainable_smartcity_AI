# Sustainable Smart City AI Assistant - Launch Script
param (
    [Parameter(Mandatory=$false)]
    [ValidateSet("docker", "backend", "frontend", "seed", "help")]
    [string]$Mode = "help"
)

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " Sustainable Smart City AI Assistant - Official Portal " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan

switch ($Mode) {
    "docker" {
        Write-Host "Launching full containerized stack (PostgreSQL + FastAPI + React)..." -ForegroundColor Yellow
        docker-compose up --build
    }
    "backend" {
        Write-Host "Starting FastAPI Backend server..." -ForegroundColor Yellow
        cd backend
        if (Test-Path "venv\Scripts\activate.ps1") {
            .\venv\Scripts\activate.ps1
        }
        uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
    }
    "frontend" {
        Write-Host "Starting React + Vite Frontend Command Center..." -ForegroundColor Yellow
        cd frontend
        npm run dev
    }
    "seed" {
        Write-Host "Running database migrations and loading 365-day seed data..." -ForegroundColor Yellow
        cd backend
        if (Test-Path "venv\Scripts\activate.ps1") {
            .\venv\Scripts\activate.ps1
        }
        alembic upgrade head
        python -c "from app.utils.seed_data import seed_initial_data; from app.core.database import SessionLocal; db = SessionLocal(); seed_initial_data(db); db.close()"
        Write-Host "Database successfully seeded!" -ForegroundColor Green
    }
    default {
        Write-Host "`nUsage Instructions:" -ForegroundColor White
        Write-Host "  .\start-smartcity.ps1 -Mode docker     # Run full Docker stack"
        Write-Host "  .\start-smartcity.ps1 -Mode backend    # Run FastAPI API on port 8000"
        Write-Host "  .\start-smartcity.ps1 -Mode frontend   # Run Vite UI on port 5173"
        Write-Host "  .\start-smartcity.ps1 -Mode seed       # Apply migrations and seed data`n"
        Write-Host "Default Demo Official Credentials:" -ForegroundColor Cyan
        Write-Host "  Super Admin:        super_admin@smartcity.gov  / Admin@123456"
        Write-Host "  City Admin:         city_admin@smartcity.gov   / CityAdmin@123"
        Write-Host "  Department Officer: officer@smartcity.gov      / Officer@123"
        Write-Host "  Data Analyst:       analyst@smartcity.gov      / Analyst@123`n"
    }
}

