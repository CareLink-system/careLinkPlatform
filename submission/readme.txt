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

# ============================================
# DATABASE CONFIGURATION (Neon DB)
# ============================================

DB_HOST=ep-snowy-feather-a14v529b-pooler.ap-southeast-1.aws.neon.tech
DB_PORT=5432
DB_USERNAME=neondb_owner
DB_PASSWORD=npg_HBgxUG39Cufl


# ============================================
# JWT CONFIGURATION
# ============================================

JWT_KEY=zN3K9xY8s7FJk2lQvWmP4aR1T6uEoB5cXsfykmdu$&DJUSL9dHfG8JkL2pQ==
JWT_ISSUER=careLinkPlatform
JWT_AUDIENCE=careLinkPlatformUsers


# ============================================
# PAYMENT (Stripe)
# ============================================

STRIPE_SECRET_KEY=sk_test_51TM5qBFGXSOnbguxQ3WoGblPcNfdrJKqNjipABzEGwbo3cDIlf2MVgZpUGczSqVFiJXRVQIdUUgXY3DApQblBiFA00nfBpRZxP


# ============================================
# AGORA VIDEO
# ============================================

AGORA__AppId=9a43ce76421e4744b0c0c41bf4513675
AGORA__AppCertificate=c371e32c77764f42b2905c88eee91af9



# ============================================
# BASE URL - LOCAL (Uncomment for local)
# ============================================

BASE_SERVICE_URL=https://localhost:5000 

# ============================================
# SERVICE URLs - LOCAL (Uncomment for local)
# ============================================
AUTH_SERVICE_URL=https://localhost:5001
PATIENT_SERVICE_URL=https://localhost:5002
DOCTOR_SERVICE_URL=https://localhost:5003
APPOINTMENT_SERVICE_URL=https://localhost:5004
TELEMEDICINE_SERVICE_URL=https://localhost:5007
PAYMENT_SERVICE_URL=https://localhost:5010
NOTIFICATION_SERVICE_URL=https://localhost:5008
SYMPTOM_CHECK_SERVICE_URL=https://localhost:8000
CHATBOT_SERVICE_URL=https://localhost:8001/openapi.json

# ============================================
# SWAGGER URLs - LOCAL (Uncomment for local)
# ============================================
AUTH_SWAGGER_URL=https://localhost:5001/swagger/v1/swagger.json
PATIENT_SWAGGER_URL=https://localhost:5002/swagger/v1/swagger.json
DOCTOR_SWAGGER_URL=https://localhost:5003/swagger/v1/swagger.json
APPOINTMENT_SWAGGER_URL=https://localhost:5004/swagger/v1/swagger.json
TELEMEDICINE_SWAGGER_URL=https://localhost:5007/swagger/v1/swagger.json
PAYMENT_SWAGGER_URL=https://localhost:5010/swagger/v1/swagger.json
NOTIFICATION_SWAGGER_URL=https://localhost:5008/swagger/v1/swagger.json
SYMPTOM_CHECK_SWAGGER_URL=https://localhost:8000/openapi.json
CHATBOT_SWAGGER_URL=https://localhost:8001/openapi.json


# ============================================
# BASE URL - PRODUCTION (Uncomment for Render)
# ============================================

#BASE_SERVICE_URL=https://localhost:5000 

# ============================================
# SERVICE URLs - PRODUCTION (Uncomment for Render)
# ============================================
# AUTH_SERVICE_URL=https://carelinkplatform.onrender.com
# PATIENT_SERVICE_URL=https://carelinkplatform-patientservice.onrender.com
# DOCTOR_SERVICE_URL=https://carelinkplatform-doctorservice.onrender.com
# APPOINTMENT_SERVICE_URL=https://carelinkplatform-1.onrender.com
# TELEMEDICINE_SERVICE_URL=https://carelinkplatform-uc4z.onrender.com
# PAYMENT_SERVICE_URL=https://carelinkplatform-paymentservice.onrender.com
# NOTIFICATION_SERVICE_URL=https://carelinkplatform-notification.onrender.com
# SYMPTOM_CHECK_SERVICE_URL=https://symptomcheckservice.onrender.com
# CHATBOT_SERVICE_URL=https://chatbotservice-1wag.onrender.com

# ============================================
# SWAGGER URLs - PRODUCTION (Uncomment for Render)
# ============================================
# AUTH_SWAGGER_URL=https://carelinkplatform.onrender.com/swagger/v1/swagger.json
# PATIENT_SWAGGER_URL=https://carelinkplatform-patientservice.onrender.com/swagger/v1/swagger.json
# DOCTOR_SWAGGER_URL=https://carelinkplatform-doctorservice.onrender.com/swagger/v1/swagger.json
# APPOINTMENT_SWAGGER_URL=https://carelinkplatform-1.onrender.com/swagger/v1/swagger.json
# TELEMEDICINE_SWAGGER_URL=https://carelinkplatform-uc4z.onrender.com/swagger/v1/swagger.json
# PAYMENT_SWAGGER_URL=https://carelinkplatform-paymentservice.onrender.com/swagger/v1/swagger.json
# NOTIFICATION_SWAGGER_URL=https://carelinkplatform-notification.onrender.com/swagger/v1/swagger.json
# SYMPTOM_CHECK_SWAGGER_URL=https://symptomcheckservice.onrender.com/openapi.json
# CHATBOT_SWAGGER_URL=https://carelinkplatform-chatbot.onrender.com/openapi.json


# =====================================================================
# Live Backend Link - https://carelinkplatform-apigateway.onrender.com
# =====================================================================


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
telemedicinedb

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
• TelemedicineService

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