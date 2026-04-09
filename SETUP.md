# CareLink Platform — Project Setup Guide

This guide walks through setting up the entire CareLink Platform backend locally (Windows). Follow the sections in order.

---

## Prerequisites

- .NET 9 SDK or later: https://dotnet.microsoft.com/download
- Visual Studio 2022 (17.8+) or VS Code with C# support
- PostgreSQL 15+ (or Docker image postgres:15)
- Git
- Docker Desktop (optional, for docker-compose)

## Repository structure (important folders)

- `backend/` — All backend projects and `docker-compose.yml`
- `backend/ApiGateway` — API Gateway (YARP)
- `backend/Services/*` — Microservices: AuthService, PatientService, DoctorService, AppointmentService, TelemedicineService, PaymentService, NotificationService

## 1) Clone repo

Open a PowerShell terminal and run:

```powershell
git clone <repo-url>
cd careLinkPlatform
```

## 2) Database setup (Postgres)

Option A — Local Postgres install:

1. Install Postgres and start the service (default port 5432).
2. Create databases used by services:

```sql
CREATE DATABASE authdb;
CREATE DATABASE patientdb;
CREATE DATABASE doctordb;
CREATE DATABASE appointmentdb;
CREATE DATABASE paymentdb;
```

Option B — Docker (quick):

```powershell
# run postgres in docker
# If local PostgreSQL already uses 5432, map Docker to 5433 instead.
docker run --name postgres-carelink -e POSTGRES_PASSWORD=admin123 -e POSTGRES_USER=admin -p 5433:5432 -d postgres:15
# connect
docker exec -it postgres-carelink psql -U admin
# inside psql:
CREATE DATABASE authdb; CREATE DATABASE patientdb; CREATE DATABASE doctordb; CREATE DATABASE appointmentdb; CREATE DATABASE paymentdb;\q
```

## 3) Configure connection strings

Each service has an `appsettings.json` (and often an `appsettings.Development.json`) in its project folder. Update the `ConnectionStrings:DefaultConnection` value to point to your Postgres host, port, database, username, and password.

If you started the Docker container above with `POSTGRES_USER=admin` and `POSTGRES_PASSWORD=admin123`, use these examples:

Example connection string for `AuthService`:

```
Host=localhost;Port=5433;Database=authdb;Username=admin;Password=admin123
```

Example connection string for `PatientService`:

```
Host=localhost;Port=5433;Database=patientdb;Username=admin;Password=admin123
```

Quick automatic update (PowerShell): run this from the repository root to update each service's appsettings files with the correct DB name, user and password. It edits `appsettings.json` and `appsettings.Development.json` where present.

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts\update-appsettings.ps1 -Port 5433
```

After running the script, open one of the service `appsettings*.json` files to verify the `DefaultConnection` value was updated.

For production use, prefer environment variables or a secret manager for DB credentials and JWT keys.

## 4) Restore NuGet packages

From repository root:

```powershell
dotnet restore
```

## 5) Apply EF Core migrations (per service)

Install EF Core CLI tool (if not installed):

```powershell
dotnet tool install --global dotnet-ef
```

Then for each service that uses EF Core (example: AuthService):

```powershell
cd backend/Services/AuthService
dotnet ef database update --connection "Host=localhost;Port=5433;Database=authdb;Username=admin;Password=admin123"
```

Repeat for `PatientService`, `DoctorService`, `AppointmentService`, `PaymentService` as needed.

If migrations already exist in the `Migrations/` folder, simply run `dotnet ef database update` to apply them.

## 6) Run services (two options)

Option A — Visual Studio (recommended for debugging):

1. Open `careLinkPlatform.sln` in Visual Studio 2022.
2. Right-click the solution → Properties → Startup Project → Multiple startup projects.
3. Set `Action = Start` for all projects you want to run (API Gateway + all services).
4. Press F5.

Option B — CLI (manual per service):

Open separate terminals and run each service with its URL:

```powershell
cd backend/Services/AuthService
dotnet run --urls=http://localhost:5001

cd backend/Services/PatientService
dotnet run --urls=http://localhost:5002

# ...repeat for other services, e.g. DoctorService:5003, AppointmentService:5004, Telemedicine:5007, Notification:5008, Payment:5010

cd backend/ApiGateway
dotnet run --urls=http://localhost:5000
```

Option C — Docker Compose

From `backend/` run:

```powershell
docker-compose up -d --build
docker-compose logs -f
```

Note: Ensure environment variables and connection strings used by Docker compose match your Postgres container or external DB.

## 7) Verify services

- API Gateway health: `http://localhost:5000/health`
- Swagger for each service: `http://localhost:{port}/swagger` (see ports in project `launchSettings.json`)

## 8) Quick test — register and call protected endpoint

1. Register a user at `POST http://localhost:5001/api/v1/auth/register` (AuthService).
2. Login at `POST http://localhost:5001/api/v1/auth/login` to receive JWT.
3. Call a protected endpoint on `PatientService` with header `Authorization: Bearer <token>`.

## 9) Troubleshooting

- Port collision: `netstat -ano | findstr :5001` then `taskkill /PID <pid> /F`.
- DB connection errors: confirm Postgres is running and connection string is correct.
- Missing packages: run `dotnet restore` per project.
- EF migrations fail: consider removing local `Migrations/` and recreating a fresh migration, or update the connection string to the correct DB.

## 10) Next steps / tips

- Use environment variables or a secret manager for JWT keys and DB passwords.
- Consider single-database per service for development to mirror microservice boundaries.
- Add a small script or `Makefile`/PowerShell script to start the common set of services in the right order for convenience.

---

If you want, I can:

- Add a PowerShell quick-start script to start all services via `dotnet run` in new consoles
- Add Docker compose overrides for local development
- Generate Postman or Swagger collection for quick testing

Tell me which next step you want me to do.