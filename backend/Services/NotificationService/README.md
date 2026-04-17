# NotificationService

Notification Service for CareLink Platform.

## What it does

- Accepts appointment booking notification requests from Appointment Service.
- Persists notification intent records in MongoDB.
- Sends email notifications using Brevo API (or an optional NodeMailer bridge endpoint).
- Sends SMS notifications using Notify.lk API.
- Returns `202 Accepted` for accepted notification requests.

## Endpoint

- `POST /api/v1/Notification/appointment-booked`

Example request body:

```json
{
  "appointmentId": "appt-123",
  "appointmentTime": "2026-04-17T15:30:00Z",
  "patientName": "John Doe",
  "patientEmail": "john@example.com",
  "patientPhone": "+94770000000",
  "doctorName": "Smith",
  "doctorEmail": "dr.smith@example.com",
  "doctorPhone": "+94771111111"
}
```

## Required configuration

Set in `appsettings*.json` or environment variables:

- `MONGO_URI` (or `Mongo:ConnectionString`)
- `MONGO_DB` (or `Mongo:DatabaseName`)
- `NotificationProviders:BrevoApiKey` or `NotificationProviders:NodeMailerEndpoint`
- `NotificationProviders:NotifyLkUserId`
- `NotificationProviders:NotifyLkApiKey`
- `NotificationProviders:NotifyLkSenderId`

## Run

```powershell
dotnet restore NotificationService.csproj
dotnet build NotificationService.csproj
dotnet run --project NotificationService.csproj
```
