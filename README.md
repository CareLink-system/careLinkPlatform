# 🏥 CareLink Platform - Backend Setup Guide

See the full project setup guide in [SETUP.md](SETUP.md).

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Database Setup](#database-setup)
- [Visual Studio Setup](#visual-studio-setup)
- [Running the Backend](#running-the-backend)
- [Database Migrations](#database-migrations)
- [API Gateway](#api-gateway)
- [Testing the APIs](#testing-the-apis)
- [Troubleshooting](#troubleshooting)

---

## 🖥️ Prerequisites

Before you begin, ensure you have the following installed:

| Software                      | Version      | Download Link                                                            |
| ----------------------------- | ------------ | ------------------------------------------------------------------------ |
| **.NET SDK**                  | 9.0 or later | [dotnet.microsoft.com](https://dotnet.microsoft.com/download/dotnet/9.0) |
| **Visual Studio 2022**        | 17.8+        | [visualstudio.microsoft.com](https://visualstudio.microsoft.com/)        |
| **PostgreSQL**                | 15+          | [postgresql.org](https://www.postgresql.org/download/)                   |
| **Git**                       | Latest       | [git-scm.com](https://git-scm.com/downloads)                             |
| **Docker Desktop** (Optional) | Latest       | [docker.com](https://www.docker.com/products/docker-desktop/)            |

### Visual Studio Workloads Required

When installing Visual Studio, ensure these workloads are selected:

- ✅ **ASP.NET and web development**
- ✅ **.NET 9 runtime**
- ✅ **Data storage and processing**

---

## 📁 Project Structure

careLinkPlatform/
├── backend/
│ ├── ApiGateway/ # API Gateway (YARP)
│ ├── Services/
│ │ ├── AuthService/ # Authentication & Authorization
│ │ ├── PatientService/ # Patient management
│ │ ├── DoctorService/ # Doctor management
│ │ ├── AppointmentService/ # Appointment booking
│ │ ├── TelemedicineService/ # Video consultations
│ │ ├── PaymentService/ # Payment processing
│ │ └── NotificationService/ # Email & SMS notifications
│ └── docker-compose.yml # Docker configuration
├── database/
│ └── scripts/ # Database initialization scripts
├── kubernetes/
│ └── deployments/ # K8s deployment files
├── .gitignore
├── careLinkPlatform.sln # Visual Studio solution
└── README.md

````

---

## 🗄️ Database Setup

### Option 1: Local PostgreSQL (Recommended for Development)

#### 1. Install PostgreSQL
- Download from: https://www.postgresql.org/download/
- Default port: `5432`
- Default user: `postgres`
- Set password during installation

#### 2. Create Databases

Open **pgAdmin** or **psql** and run:

```sql
-- Create databases for each service
CREATE DATABASE authdb;
CREATE DATABASE patientdb;
CREATE DATABASE doctordb;
CREATE DATABASE appointmentdb;
CREATE DATABASE paymentdb;

-- List all databases
\l
````

#### 3. Update Connection Strings

Update each service's appsettings.json:

**AuthService/appsettings.json:**

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=authdb;Username=postgres;Password=yourpassword"
  }
}
```

**PatientService/appsettings.json:**

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=patientdb;Username=postgres;Password=yourpassword"
  }
}
```

Repeat for each service with respective database names.

### Option 2: Neon DB (Cloud PostgreSQL - Free Tier)

- Go to https://neon.tech
- Sign up with GitHub/Google
- Create a new project
- Copy the connection string:

```
Host=ep-xxx.cloud.neon.tech;Port=5432;Database=neondb;Username=neondb_owner;Password=yourpassword;SslMode=Require;
```

### Option 3: Docker PostgreSQL (Quick Setup)

```bash
# Run PostgreSQL in Docker
docker run --name postgres-carelink \
  -e POSTGRES_PASSWORD=admin123 \
  -e POSTGRES_USER=admin \
  -p 5432:5432 \
  -d postgres:15

# Connect to PostgreSQL
docker exec -it postgres-carelink psql -U admin

# Create databases
CREATE DATABASE authdb;
CREATE DATABASE patientdb;
CREATE DATABASE doctordb;
CREATE DATABASE appointmentdb;
CREATE DATABASE paymentdb;
\q
```

## 🛠️ Visual Studio Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/careLinkPlatform.git
cd careLinkPlatform
```

### Step 2: Open the Solution

- Launch Visual Studio 2022
- Click File → Open → Project/Solution
- Navigate to careLinkPlatform/careLinkPlatform.sln
- Click Open

### Step 3: Verify Solution Explorer Structure

You should see:

```
Solution 'careLinkPlatform' (8 projects)
├── ApiGateway
├── AuthService
├── PatientService
├── DoctorService
├── AppointmentService
├── TelemedicineService
├── PaymentService
└── NotificationService
```

If any project is missing:

- Right-click Solution → Add → Existing Project
- Navigate to the project's .csproj file
- Click Open

### Step 4: Restore NuGet Packages

```bash
# In Visual Studio:
Build → Restore NuGet Packages

# OR using .NET CLI:
dotnet restore
```

### Step 5: Set Multiple Startup Projects

- Right-click the solution in Solution Explorer
- Select Properties
- Go to Common Properties → Startup Project
- Select Multiple startup projects
- Set ALL projects to Start:

```
┌─────────────────────┬─────────┐
│ Project             │ Action  │
├─────────────────────┼─────────┤
│ ApiGateway          │ Start   │
│ AuthService         │ Start   │
│ PatientService      │ Start   │
│ DoctorService       │ Start   │
│ AppointmentService  │ Start   │
│ TelemedicineService │ Start   │
│ PaymentService      │ Start   │
│ NotificationService │ Start   │
└─────────────────────┴─────────┘
```

Click Apply → OK

### Step 6: Verify Port Assignments

Check each service's Properties/launchSettings.json for unique ports:

| Service | Port | File Location |
| ApiGateway | 5000 | backend/ApiGateway/Properties/launchSettings.json |
| AuthService | 5001 | backend/Services/AuthService/Properties/launchSettings.json |
| PatientService | 5002 | backend/Services/PatientService/Properties/launchSettings.json |
| DoctorService | 5003 | backend/Services/DoctorService/Properties/launchSettings.json |
| AppointmentService | 5004 | backend/Services/AppointmentService/Properties/launchSettings.json |
| TelemedicineService | 5007 | backend/Services/TelemedicineService/Properties/launchSettings.json |
| NotificationService | 5008 | backend/Services/NotificationService/Properties/launchSettings.json |
| PaymentService | 5010 | backend/Services/PaymentService/Properties/launchSettings.json |

Example launchSettings.json:

```json
{
  "profiles": {
    "AuthService": {
      "commandName": "Project",
      "launchBrowser": true,
      "launchUrl": "swagger",
      "applicationUrl": "http://localhost:5001",
      "environmentVariables": {
        "ASPNETCORE_ENVIRONMENT": "Development"
      }
    }
  }
}
```

## 🚀 Running the Backend

### Option 1: Run from Visual Studio

- Press F5 or click the green Start button
- All 8 services will start simultaneously
- Console windows will open for each service
- Swagger UI will open for each service automatically

### Option 2: Run from .NET CLI

Open separate terminals for each service:

```bash
# Terminal 1 - AuthService
cd backend/Services/AuthService
dotnet run --urls=http://localhost:5001

# Terminal 2 - PatientService
cd backend/Services/PatientService
dotnet run --urls=http://localhost:5002

# Terminal 3 - DoctorService
cd backend/Services/DoctorService
dotnet run --urls=http://localhost:5003

# Terminal 4 - AppointmentService
cd backend/Services/AppointmentService
dotnet run --urls=http://localhost:5004

# Terminal 5 - TelemedicineService
cd backend/Services/TelemedicineService
dotnet run --urls=http://localhost:5007

# Terminal 6 - NotificationService
cd backend/Services/NotificationService
dotnet run --urls=http://localhost:5008

# Terminal 7 - PaymentService
cd backend/Services/PaymentService
dotnet run --urls=http://localhost:5010

# Terminal 8 - ApiGateway
cd backend/ApiGateway
dotnet run --urls=http://localhost:5000
```

### Option 3: Run with Docker Compose

```bash
cd backend
docker-compose up -d
docker-compose logs -f
```

## 📦 Database Migrations

### What are Migrations?

Migrations are version control for your database schema. They allow you to:

- Create tables from your C# models
- Update schema when models change
- Track database changes in Git

### Install EF Core Tools (One Time)

```bash
dotnet tool install --global dotnet-ef
```

### Run Migrations for Each Service

#### AuthService:

```bash
cd backend/Services/AuthService

# Create initial migration
dotnet ef migrations add InitialCreate

# Apply to database
dotnet ef database update

# If you change models later, create new migration
dotnet ef migrations add AddPhoneNumber
dotnet ef database update
```

#### PatientService:

```bash
cd backend/Services/PatientService
dotnet ef migrations add InitialCreate
dotnet ef database update
```

#### DoctorService:

```bash
cd backend/Services/DoctorService
dotnet ef migrations add InitialCreate
dotnet ef database update
```

#### AppointmentService:

```bash
cd backend/Services/AppointmentService
dotnet ef migrations add InitialCreate
dotnet ef database update
```

#### PaymentService:

```bash
cd backend/Services/PaymentService
dotnet ef migrations add InitialCreate
dotnet ef database update
```

### Verify Migrations Applied

Check your database using pgAdmin or psql:

```sql
-- Connect to authdb
\c authdb

-- List tables
\dt

-- You should see:
-- public | Users | table | postgres
```

### Migration Commands Reference

| Command | Purpose |
| dotnet ef migrations add [Name] | Create a new migration |
| dotnet ef database update | Apply all pending migrations |
| dotnet ef migrations remove | Remove last migration |
| dotnet ef database drop --force | Drop database |
| dotnet ef migrations script | Generate SQL script |
| dotnet ef database update [MigrationName] | Rollback to specific migration |

## 🌐 API Gateway

The API Gateway (port 5000) routes all requests to the appropriate microservices:

| Route | Target Service |
| /api/auth/_ | AuthService (5001) |
| /api/patients/_ | PatientService (5002) |
| /api/doctors/_ | DoctorService (5003) |
| /api/appointments/_ | AppointmentService (5004) |
| /api/telemedicine/_ | TelemedicineService (5007) |
| /api/notifications/_ | NotificationService (5008) |
| /api/payments/\* | PaymentService (5010) |

### Health Check

```
GET http://localhost:5000/health
```

### Swagger Documentation

```
http://localhost:5000/swagger
```

## 🧪 Testing the APIs

### Using Swagger (Easiest)

Each service has Swagger UI:

```
AuthService:        http://localhost:5001/swagger
PatientService:     http://localhost:5002/swagger
DoctorService:      http://localhost:5003/swagger
AppointmentService: http://localhost:5004/swagger
TelemedicineService: http://localhost:5007/swagger
NotificationService: http://localhost:5008/swagger
PaymentService:     http://localhost:5010/swagger
ApiGateway:         http://localhost:5000/swagger
```

### Using Postman

- Download Postman: https://www.postman.com/
- Import the collection (if available)
- Or test individual endpoints:

#### Test AuthService:

```http
POST http://localhost:5001/api/v1/auth/register
Content-Type: application/json

{
  "email": "patient@example.com",
  "password": "Password123!",
  "firstName": "John",
  "lastName": "Doe",
  "role": "Patient"
}
```

```http
POST http://localhost:5001/api/v1/auth/login
Content-Type: application/json

{
  "email": "patient@example.com",
  "password": "Password123!"
}
```

Response will include JWT token. Copy it.

#### Test PatientService (with JWT):

```http
GET http://localhost:5002/api/patients/profile
Authorization: Bearer [your-jwt-token]
```

## 🔧 Troubleshooting

### Error: Port already in use

```bash
# Find process using port
netstat -ano | findstr :5001

# Kill the process (replace PID with actual number)
taskkill /PID 12345 /F

# Or kill all dotnet processes
taskkill /F /IM dotnet.exe
```

### Error: Cannot connect to database

```bash
# Check if PostgreSQL is running
# Windows: services.msc → PostgreSQL service
# Mac/Linux: pg_ctl status

# Test connection
psql -h localhost -p 5432 -U postgres -d authdb

# If using Docker
docker ps | grep postgres
docker logs postgres-carelink
```

### Error: Missing NuGet packages

```bash
# Restore all packages
dotnet restore

# Or for specific project
cd backend/Services/AuthService
dotnet restore
```

### Error: Swagger not opening

Check Program.cs has:

```csharp
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
```

### Error: Migration fails

```bash
# Remove existing migrations
rm -rf Migrations/

# Create fresh migration
dotnet ef migrations add InitialCreate

# Apply to database
dotnet ef database update
```

### Error: JWT authentication fails

Verify appsettings.json:

```json
{
  "Jwt": {
    "Key": "your-super-secret-key-at-least-32-characters-long",
    "Issuer": "careLinkPlatform",
    "Audience": "careLinkPlatformUsers"
  }
}
```

## ✅ Verification Checklist

After setup, verify:

```
☐ PostgreSQL is running (port 5432)
☐ All databases created (authdb, patientdb, etc.)
☐ All migrations applied successfully
☐ Visual Studio solution loads all 8 projects
☐ Multiple startup projects configured
☐ All services have unique ports
☐ Press F5 - all 8 console windows open
☐ Swagger loads at http://localhost:5001/swagger
☐ API Gateway loads at http://localhost:5000/health
☐ Can register a user
☐ Can login and receive JWT token
```

## 📞 Need Help?

- EF Core Documentation: https://docs.microsoft.com/en-us/ef/core/

- .NET 9 Documentation: https://docs.microsoft.com/en-us/dotnet/
- PostgreSQL Documentation: https://www.postgresql.org/docs/
- YARP Reverse Proxy: https://microsoft.github.io/reverse-proxy/

## 📝 Notes

- All services must be running simultaneously for the platform to work
- The API Gateway routes requests to individual services

Each service has its own database (per microservices pattern)

JWT tokens expire after 7 days (configurable)

For production, use environment variables or Azure Key Vault for secrets

Ready to start! 🚀

text

---

## 🎯 **QUICK REFERENCE COMMANDS**

Save this as `quick-commands.md` for easy reference:

````markdown
# Quick Commands Reference

## Database

```bash
# Start PostgreSQL (Docker)
docker run --name postgres -e POSTGRES_PASSWORD=admin123 -p 5432:5432 -d postgres:15

# Create databases
docker exec -it postgres psql -U postgres
CREATE DATABASE authdb;
CREATE DATABASE patientdb;
\q
Migrations
bash
cd backend/Services/AuthService
dotnet ef migrations add InitialCreate
dotnet ef database update
Run Services
bash
# Visual Studio: Press F5

# Or CLI
cd backend/Services/AuthService && dotnet run --urls=http://localhost:5001
Check Ports
bash
netstat -ano | findstr :5001
taskkill /PID [PID] /F
Docker
bash
cd backend
docker-compose build
docker-compose up -d
docker-compose logs -f
text

userName - dinildulneth@gmail.com
Password - dinildulnet123!@#
---

**Now you have a complete README for your backend!** 📚🚀
```
````
