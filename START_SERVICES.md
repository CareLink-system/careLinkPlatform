# Start Services — CareLinkPlatform

This guide describes how to start the services you listed (backend: `AuthService`, `TelemedicineService`, `SymptomCheckService`; frontend) after the initial setup. It contains exact directories and copy-paste commands for Windows PowerShell. Use Docker for convenience (recommended) or run services locally if you prefer.

**Prerequisites (install once)**
- **Docker Desktop** (with Docker Compose) — used for DBs and optional containers.
- **.NET 9 SDK** (required for the .NET services targeting `net9.0`).
- **Node.js 18+ and npm** (for frontend / Vite).
- **Python 3.11+** (for `SymptomCheckService`) and `pip`.

---

**Directory layout (repo root = repository root)**
- Backend docker-compose: `backend/docker-compose.yml`
- Auth service: `backend/Services/AuthService`
- Telemedicine service: `backend/Services/TelemedicineService`
- Symptom checker (FastAPI): `backend/Services/SymptomCheckService`
- Frontend: `frontend`

---

1) Initial one-time setup (on your machine)

- From repo root: restore .NET and install frontend deps

```powershell
cd f:\careLinkPlatform
dotnet restore

# Install frontend deps
cd frontend
npm install

# Create python venv for symptom checker (optional, recommended)
cd ..\backend\Services\SymptomCheckService
python -m venv .venv
.\.venv\Scripts\Activate
pip install -r requirements.txt

# Back to repo root
cd f:\careLinkPlatform
```

Note: creating the Python venv is optional if you prefer Docker for the symptom checker.

2) Option A — Recommended: use Docker Compose (fast, reproducible)

- This runs DBs (Postgres, MongoDB, Redis) plus built containers. Run from the `backend` directory.

```powershell
cd f:\careLinkPlatform\backend

# (Re)build the 3 services you want plus the gateway (optional) and required infra
docker-compose build --no-cache auth-service telemedicine-service symptom-checker-service api-gateway

# Start required infra (will create volumes) and the selected services
docker-compose up -d postgres mongodb redis auth-service telemedicine-service symptom-checker-service api-gateway

# Check status
docker-compose ps

# Follow logs (example)
docker-compose logs -f auth-service telemedicine-service symptom-checker-service api-gateway
```

Notes:
- The `docker-compose.yml` maps container ports to host ports: API Gateway `5000`, Auth `5001`, Telemedicine `5007`, Symptom Checker `8080` (see file if unsure).
- If you only want to start infra first: `docker-compose up -d postgres mongodb redis` then bring services up separately.

To stop and remove containers (while keeping volumes):

```powershell
cd f:\careLinkPlatform\backend
docker-compose down
```

To remove volumes (clean DBs):

```powershell
docker-compose down -v
```

3) Option B — Run services locally (no service containers) while using Docker for DBs

Use this if you want to run the .NET and Python apps directly on your host for debugging.

a) Start infra (Postgres, Mongo, Redis) from `backend` (still use Docker Compose):

```powershell
cd f:\careLinkPlatform\backend
docker-compose up -d postgres mongodb redis
```

b) Run `AuthService` locally (PowerShell example)

```powershell
cd f:\careLinkPlatform\backend\Services\AuthService

# Set env vars so the local service connects to the postgres container on localhost
$env:ASPNETCORE_ENVIRONMENT = 'Development'
$env:ConnectionStrings__DefaultConnection = 'Host=localhost;Port=5432;Database=authdb;Username=admin;Password=admin123'
$env:Jwt__Key = 'your-super-secret-key-for-development-only'

dotnet run
```

c) Run `TelemedicineService` locally

```powershell
cd f:\careLinkPlatform\backend\Services\TelemedicineService

# Telemedicine uses DotNetEnv and expects a .env — you can edit the .env or set env vars
$env:ASPNETCORE_ENVIRONMENT = 'Development'
$env:MongoDb__ConnectionString = 'mongodb://localhost:27017'

dotnet run
```

d) Run `SymptomCheckService` locally (Python)

```powershell
cd f:\careLinkPlatform\backend\Services\SymptomCheckService
.\.venv\Scripts\Activate      # if you created venv earlier

# Option 1: use .env as shipped (may point to remote Atlas). To point to local mongo container:
$env:MONGO_URI = 'mongodb://localhost:27017/symptomcheck'
$env:PORT = '8080'

# Run with uvicorn (bind 0.0.0.0 so containers can reach it if needed)
python -m uvicorn main:app --host 0.0.0.0 --port 8080 --reload
```

e) Run frontend (Vite)

```powershell
cd f:\careLinkPlatform\frontend
npm run dev
```

Open the frontend in your browser (Vite default): http://localhost:5173 — the frontend will call the API Gateway at http://localhost:5000 if configured that way.

4) Minimal health checks and endpoints

- API Gateway: http://localhost:5000/ (or `/swagger`)
- AuthService: http://localhost:5001/health and http://localhost:5001/swagger
- Telemedicine: http://localhost:5007/swagger or health endpoints if enabled
- Symptom Checker: http://localhost:8080/docs (FastAPI auto docs) or `/health` if implemented

5) Troubleshooting tips

- If a service fails to start because it cannot connect to Postgres/Mongo, ensure the DB containers are running and you used `localhost` host when running the service locally (Docker maps ports to localhost).
- View logs:

```powershell
cd f:\careLinkPlatform\backend
docker-compose logs -f auth-service
```

- Rebuild container images if code changed:

```powershell
cd f:\careLinkPlatform\backend
docker-compose build auth-service telemedicine-service symptom-checker-service api-gateway
```

- Clear and recreate DBs (danger: will delete data):

```powershell
cd f:\careLinkPlatform\backend
docker-compose down -v
docker-compose up -d postgres mongodb redis
```

6) Quick checklists

- Quick Docker start (recommended):

```powershell
cd f:\careLinkPlatform\backend
docker-compose up -d postgres mongodb redis auth-service telemedicine-service symptom-checker-service api-gateway
cd ..\frontend
npm run dev
```

- Quick local run (for debugging):

```powershell
# Start infra
cd f:\careLinkPlatform\backend
docker-compose up -d postgres mongodb redis

# In separate windows, run services locally
cd f:\careLinkPlatform\backend\Services\AuthService; $env:ConnectionStrings__DefaultConnection='Host=localhost;Port=5432;Database=authdb;Username=admin;Password=admin123'; dotnet run
cd f:\careLinkPlatform\backend\Services\TelemedicineService; $env:MongoDb__ConnectionString='mongodb://localhost:27017'; dotnet run
cd f:\careLinkPlatform\backend\Services\SymptomCheckService; .\.venv\Scripts\Activate; $env:MONGO_URI='mongodb://localhost:27017/symptomcheck'; python -m uvicorn main:app --host 0.0.0.0 --port 8080 --reload
cd f:\careLinkPlatform\frontend; npm run dev
```

---

If you'd like, I can:
- add PowerShell scripts to automate these sequences (e.g., `scripts/start-dev.ps1` and `scripts/stop-dev.ps1`)
- or create a one-liner `docker-compose` file that only starts the four services you specified.

File created: [START_SERVICES.md](START_SERVICES.md)
