# ChatbotService

CareLink's patient chatbot backend.

## Run locally

```powershell
cd backend/Services/ChatbotService
python -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

The service reads `MONGO_URI` and `GEMINI_API_KEY` from environment variables or a local `.env` file.
