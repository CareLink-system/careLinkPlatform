CareLink Platform – Deployment Guide

Project: AI-Enabled Smart Healthcare Appointment & Telemedicine Platform
Repository: https://github.com/CareLink-system/careLinkPlatform.git

----------------------------------------
Prerequisites
----------------------------------------
• .NET SDK 9.0+
• Visual Studio 2026
• VS Code
• PgAdmin
• PostgreSQL (or Neon DB)
• Git
• (Optional) Docker Desktop

----------------------------------------
Step 1: Clone Repository
----------------------------------------
git clone https://github.com/CareLink-system/careLinkPlatform.git
cd careLinkPlatform

----------------------------------------
Step 2: Environment Configuration
----------------------------------------
Create a .env file in the root or backend folder to manage environment variables.

Example:

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=yourpassword

JWT_SECRET=your_jwt_secret
JWT_ISSUER=careLinkPlatform
JWT_AUDIENCE=careLinkPlatform

All backend services use shared environment variables.

The API Gateway reads and centralizes configuration using appsettings.json,
reducing duplication across services.

----------------------------------------
Step 3: Setup Database
----------------------------------------
Install PostgreSQL and create databases:

authdb
patientdb
doctordb
appointmentdb
paymentdb

Update connection strings in API Gateway or shared configuration.

----------------------------------------
Step 4: Run Database Migrations
----------------------------------------
Run migrations for each service to create database schema:

Example:

cd backend/Services/AuthService
dotnet ef migrations add InitialCreate
dotnet ef database update

Repeat for:
• PatientService
• DoctorService
• AppointmentService
• PaymentService

----------------------------------------
Step 5: Open Project
----------------------------------------
Open careLinkPlatform.sln using Visual Studio 2022.

Restore packages:
Build → Restore NuGet Packages

----------------------------------------
Step 6: Configure Startup
----------------------------------------
Set multiple startup projects:

• ApiGateway
• AuthService
• PatientService
• DoctorService
• AppointmentService
• TelemedicineService
• PaymentService
• NotificationService

----------------------------------------
Step 7: Run Application
----------------------------------------
Press F5 in Visual Studio.

All services will start and communicate via API Gateway.

----------------------------------------
Step 8: API Testing
----------------------------------------
Use Swagger UI to test APIs through API Gateway.

Example:
http://localhost:5000/swagger
http://localhost:5000/index.html

----------------------------------------
Step 9: Optional (Docker)
----------------------------------------
cd backend
docker-compose up -d

----------------------------------------
Notes
----------------------------------------
• Microservices architecture with API Gateway pattern
• Centralized configuration using .env and shared settings
• PostgreSQL database per service (Database-per-service pattern)
• Supports Patient, Doctor, and Admin roles
• Includes appointment booking, telemedicine, payments, and notifications
• EF Core migrations used for schema management

==========================================