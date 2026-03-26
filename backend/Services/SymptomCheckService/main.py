from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime

from symptomcheckservice.schemas import SymptomRequest, SymptomResponse
from symptomcheckservice.ml_service import MLService
from symptomcheckservice.database import get_database

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ml_service = MLService(model_path="model.pkl")
db = get_database()


@app.post("/api/symptom-checker/analyze", response_model=SymptomResponse)
async def analyze(req: SymptomRequest):
    payload = req.symptoms if req.symptoms else req.description
    predicted, confidence = await ml_service.predict(payload)

    doc = req.dict()
    doc.update({"predicted_condition": predicted, "confidence": confidence, "created_at": datetime.utcnow()})

    try:
        await db["analyses"].insert_one(doc)
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to save analysis")

    return SymptomResponse(predicted_condition=predicted, confidence=confidence)
