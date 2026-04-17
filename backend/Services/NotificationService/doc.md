# Notification Setup Guide (Brevo + Notify.lk)

This guide makes appointment notifications fully functional so that when a patient books from the frontend, both patient and doctor receive:

- Email via Brevo
- SMS via Notify.lk

## 1. Architecture flow

1. Frontend calls AppointmentService `POST /api/v1/appointments`
2. AppointmentService saves the appointment
3. AppointmentService collects patient/doctor contacts from Patient/Doctor/Auth services
4. AppointmentService calls NotificationService `POST /api/v1/Notification/appointment-booked`
5. NotificationService:
   - logs records in MongoDB
   - sends email through Brevo
   - sends SMS through Notify.lk
   - returns `202 Accepted`

## 2. Required provider accounts

- Brevo account with API key
- Notify.lk account with:
  - `user_id`
  - `api_key`
  - approved `sender_id`
- MongoDB database (Atlas or self-hosted)

## 3. NotificationService configuration

The service expects these environment variables (examples and recommended names):

- `BREVO_API_KEY` — Brevo v3 API key (transactional email).
- `BREVO_SENDER_EMAIL` — Verified sender email (example: no-reply@yourdomain.com).
- `BREVO_SENDER_NAME` — Sender display name (example: "CareLink Notifications").
- `NOTIFYLK_USER_ID` — Notify.lk user id.
- `NOTIFYLK_API_KEY` — Notify.lk API key / secret.
- `NOTIFYLK_SENDER_ID` — Approved sender id (alpha or numeric short code).
- `NOTIFICATION_MONGO_URI` — MongoDB connection string (e.g. mongodb://user:pass@host:27017).
- `NOTIFICATION_MONGO_DB` — Mongo database name (e.g. carelink_notifications).
- `NOTIFICATION_BASE_URL` — Base URL where NotificationService listens (e.g. http://localhost:5002).

Example PowerShell env settings (local dev):

```powershell
$env:BREVO_API_KEY = "<your-brevo-key>"
$env:BREVO_SENDER_EMAIL = "no-reply@yourdomain.com"
$env:BREVO_SENDER_NAME = "CareLink Notifications"
$env:NOTIFYLK_USER_ID = "<your-notify-user>"
$env:NOTIFYLK_API_KEY = "<your-notify-key>"
$env:NOTIFYLK_SENDER_ID = "<your-sender-id>"
$env:NOTIFICATION_MONGO_URI = "mongodb://user:pass@localhost:27017"
$env:NOTIFICATION_MONGO_DB = "carelink_notifications"
$env:NOTIFICATION_BASE_URL = "http://localhost:5002"
dotnet run --project NotificationService.csproj
```

If you prefer `appsettings.json`, map these keys under `NotificationProviders` and `Mongo` as already present in the project.

---

## 4. Brevo (email) — exact steps to get API key & verify sender

1. Create a Brevo account: https://www.brevo.com and verify the account email.
2. Verify a sender email or domain:
   - Dashboard → Settings → Senders & domains → Add sender or Add domain.
   - If you add an email, click the verification link sent to that mailbox.
   - If you add a domain, add the DNS/TXT records for SPF/DKIM as instructed and wait for propagation.
3. Create an API key (v3):
   - Dashboard → Settings → SMTP & API → API keys → Create a new API key.
   - Name the key (e.g., NotificationService-Prod), grant only necessary scopes, and copy the generated key immediately.

Brevo quick verification (curl)

Replace variables and run the command to send a simple test email via Brevo:

```bash
curl -s --request POST "https://api.brevo.com/v3/smtp/email" \
  -H "accept: application/json" \
  -H "Content-Type: application/json" \
  -H "api-key: ${BREVO_API_KEY}" \
  --data '{
    "sender": {"email":"'${BREVO_SENDER_EMAIL}'","name":"'${BREVO_SENDER_NAME}'"},
    "to": [{"email":"recipient@example.com","name":"Recipient"}],
    "subject": "Brevo test email",
    "htmlContent": "<html><body><h1>Test</h1><p>This is a test from NotificationService.</p></body></html>"
  }'
```

Expected: HTTP 200/201 JSON response. If 401, re-check the API key and sender verification.

Notes:
- Use domain verification (DKIM/SPF) for production to improve deliverability.
- Store the API key in a secrets manager and limit its scope.

---

## 5. Notify.lk (SMS) — exact steps to obtain credentials and register sender

1. Create a Notify.lk account at https://www.notify.lk and verify your account.
2. In the dashboard find the API/Developer or Integration area to generate an API key and locate your `user_id`.
3. Register and request approval for a sender id (alpha or numeric short-code). Provider approval may require business documents and can take time.

Common form POST example (many Notify.lk integrations use a form POST):

```bash
curl -s -X POST "https://www.notify.lk/api/v1/send" \
  -d "user_id=${NOTIFYLK_USER_ID}" \
  -d "api_key=${NOTIFYLK_API_KEY}" \
  -d "sender_id=${NOTIFYLK_SENDER_ID}" \
  -d "to=94771234567" \
  -d "message=Test message from NotificationService"
```

If the provider's exact endpoint or parameter names differ, follow their API docs — the repo's SMS code posts `user_id`, `api_key`, `sender_id`, `to`, and `message` as form data.

Notes:
- Use international phone format your provider expects (Sri Lanka: `94` + number without leading 0, e.g. `94771234567`).
- Ensure sender id is approved before sending to production numbers.

---

## 6. MongoDB — create DB and user

1. Provision MongoDB (Atlas or self-hosted).
2. Create a database user with readWrite on the notifications DB.
3. Set `NOTIFICATION_MONGO_URI` to your connection string and `NOTIFICATION_MONGO_DB` to the DB name.

---

## 7. Verify NotificationService end-to-end (local smoke test)

1. Start MongoDB and NotificationService with the environment variables from section 3.
2. POST a test appointment notification to NotificationService:

```bash
curl -X POST "${NOTIFICATION_BASE_URL}/api/v1/Notification/appointment-booked" \
  -H "Content-Type: application/json" \
  --data '{
    "appointmentId":"test-apt-1",
    "appointmentDateUtc":"2026-04-17T10:00:00Z",
    "patient": {"name":"Patient Name","email":"patient@example.com","phone":"94771234567"},
    "doctor": {"name":"Doctor Name","email":"doctor@example.com","phone":"94771234568"},
    "notes":"Local smoke test"
  }'
```

3. Expected results:
   - NotificationService returns `202 Accepted`.
   - A notification record is persisted in MongoDB.
   - Brevo delivers the test email to the `patient` and `doctor` addresses.
   - Notify.lk delivers SMS to both phone numbers (if sender id approved).

If a provider call fails, check NotificationService logs for provider response bodies and HTTP status codes.

---

## 8. Troubleshooting & production hardening

- Brevo 401: re-check `BREVO_API_KEY` and that the `BREVO_SENDER_EMAIL` is verified.
- Notify.lk failure: confirm `NOTIFYLK_SENDER_ID` is approved and phone number formatting is correct.
- If you hit rate limits or transient errors, add retries/backoff (Polly or background queue) and a dead-letter mechanism.
- Secure internal auth contact endpoint (`GET /api/v1/Auth/Users/internal/{id}/contact`) so only internal services can call it (IP allowlist or internal token).
- Rotate and store keys in a secure secret store; never commit keys to git.

---

If you want, I can:

- add a small `scripts/` test script to the repo that runs the Brevo and Notify.lk checks automatically, or
- add a Docker Compose example with env file to spin up NotificationService + a test Mongo instance and run the smoke test.

End of guide.
