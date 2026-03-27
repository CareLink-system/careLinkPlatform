from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime

from schemas import SymptomRequest, SymptomResponse
from ml_service import MLService
from database import get_database

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ml_service = MLService()
db = get_database()

@app.post("/api/symptom-checker/analyze", response_model=SymptomResponse)
async def analyze(req: SymptomRequest):
    payload = req.symptoms if req.symptoms else req.description
    
    predicted, confidence, specialty, feedback = await ml_service.predict(payload)

    doc = req.dict()
    doc.update({
        "predicted_condition": predicted, 
        "confidence": confidence, 
        "recommended_specialty": specialty,
        "ai_feedback": feedback,
        "created_at": datetime.utcnow()
    })

    try:
        await db["analyses"].insert_one(doc)
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to save analysis to database")

    return SymptomResponse(
        predicted_condition=predicted, 
        confidence=confidence,
        recommended_specialty=specialty,
        ai_feedback=feedback
    )


# --- NEW ENDPOINT FOR HISTORY ---
@app.get("/api/symptom-checker/history/{user_id}")
async def get_history(user_id: str):
    try:
        # Fetch user's history from MongoDB, sorted by newest first (-1)
        cursor = db["analyses"].find({"user_id": user_id}).sort("created_at", -1).limit(10)
        history = await cursor.to_list(length=10)
        
        # Convert MongoDB _id (ObjectId) to string for JSON serialization
        for doc in history:
            doc["_id"] = str(doc["_id"])
            
        return history
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch history: {str(e)}")