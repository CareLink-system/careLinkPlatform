from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from bson import ObjectId

from schemas import SymptomRequest, SymptomResponse, AnalysisFeedbackRequest
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


def _serialize_doc(doc):
    doc["_id"] = str(doc["_id"])
    return doc


def _parse_object_id(raw_id: str) -> ObjectId:
    if not ObjectId.is_valid(raw_id):
        raise HTTPException(status_code=400, detail="Invalid analysis_id")
    return ObjectId(raw_id)

@app.post("/api/symptom-checker/analyze", response_model=SymptomResponse)
async def analyze(req: SymptomRequest):
    payload = req.symptoms if req.symptoms else req.description
    
    predicted, confidence, specialty, feedback = await ml_service.predict(payload)

    doc = req.dict()
    doc.update({
        "symptoms_reported": req.symptoms or [],
        "predicted_condition": predicted, 
        "confidence": confidence, 
        "recommended_specialty": specialty,
        "ai_feedback": feedback,
        "feedback": None,
        "created_at": datetime.utcnow()
    })

    inserted_id = None
    try:
        result = await db["analyses"].insert_one(doc)
        inserted_id = str(result.inserted_id)
    except Exception as e:
        # Do not fail user-facing analysis when persistence is temporarily unavailable.
        print(f"WARNING: Failed to save analysis to database: {e}")

    return SymptomResponse(
        analysis_id=inserted_id,
        predicted_condition=predicted, 
        confidence=confidence,
        recommended_specialty=specialty,
        ai_feedback=feedback
    )


@app.get("/api/symptom-checker/symptoms")
async def get_symptoms():
    return {"symptoms": ml_service.features}


@app.get("/api/symptom-checker/analyze/{analysis_id}")
async def get_analysis(analysis_id: str):
    object_id = _parse_object_id(analysis_id)
    try:
        doc = await db["analyses"].find_one({"_id": object_id})
        if not doc:
            raise HTTPException(status_code=404, detail="Analysis not found")
        return _serialize_doc(doc)
    except HTTPException:
        raise
    except Exception as e:
        print(f"WARNING: Failed to fetch analysis: {e}")
        raise HTTPException(status_code=503, detail="Analysis service unavailable")


# --- NEW ENDPOINT FOR HISTORY ---
@app.get("/api/symptom-checker/history/{user_id}")
async def get_history(user_id: str):
    try:
        # Fetch user's history from MongoDB, sorted by newest first (-1)
        cursor = db["analyses"].find({"user_id": user_id}).sort("created_at", -1).limit(10)
        history = await cursor.to_list(length=10)
        
        # Convert MongoDB _id (ObjectId) to string for JSON serialization
        for doc in history:
            _serialize_doc(doc)
            
        return history
    except Exception as e:
        # Return empty history instead of propagating backend storage issues to UI.
        print(f"WARNING: Failed to fetch history: {e}")
        return []


@app.delete("/api/symptom-checker/analyze/{analysis_id}")
async def delete_analysis(analysis_id: str):
    object_id = _parse_object_id(analysis_id)
    try:
        result = await db["analyses"].delete_one({"_id": object_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Analysis not found")
        return {"deleted": True, "analysis_id": analysis_id}
    except HTTPException:
        raise
    except Exception as e:
        print(f"WARNING: Failed to delete analysis: {e}")
        raise HTTPException(status_code=503, detail="Analysis service unavailable")


@app.delete("/api/symptom-checker/history/{user_id}")
async def clear_history(user_id: str):
    try:
        result = await db["analyses"].delete_many({"user_id": user_id})
        return {"deleted_count": result.deleted_count, "user_id": user_id}
    except Exception as e:
        print(f"WARNING: Failed to clear history: {e}")
        return {"deleted_count": 0, "user_id": user_id}


@app.patch("/api/symptom-checker/analyze/{analysis_id}/feedback")
async def set_feedback(analysis_id: str, payload: AnalysisFeedbackRequest):
    object_id = _parse_object_id(analysis_id)
    try:
        result = await db["analyses"].update_one(
            {"_id": object_id},
            {
                "$set": {
                    "feedback": {"was_accurate": payload.was_accurate},
                    "feedback_updated_at": datetime.utcnow(),
                }
            },
        )
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Analysis not found")
        return {"updated": True, "analysis_id": analysis_id, "was_accurate": payload.was_accurate}
    except HTTPException:
        raise
    except Exception as e:
        print(f"WARNING: Failed to update feedback: {e}")
        return {"updated": False, "analysis_id": analysis_id, "was_accurate": payload.was_accurate}


@app.get("/api/symptom-checker/stats")
async def get_stats(x_role: str | None = Header(default=None)):
    if (x_role or "").lower() != "admin":
        raise HTTPException(status_code=403, detail="Admin role required")

    try:
        total = await db["analyses"].count_documents({})

        common_cursor = db["analyses"].aggregate([
            {"$group": {"_id": "$predicted_condition", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}},
            {"$limit": 10},
        ])
        common = await common_cursor.to_list(length=10)

        avg_cursor = db["analyses"].aggregate([
            {"$group": {"_id": None, "avg_confidence": {"$avg": "$confidence"}}}
        ])
        avg_result = await avg_cursor.to_list(length=1)
        avg_confidence = avg_result[0]["avg_confidence"] if avg_result else 0

        return {
            "total_analyses": total,
            "average_ai_confidence": avg_confidence,
            "most_common_predicted_conditions": [
                {"condition": row["_id"], "count": row["count"]} for row in common
            ],
        }
    except Exception as e:
        print(f"WARNING: Failed to fetch stats: {e}")
        return {
            "total_analyses": 0,
            "average_ai_confidence": 0,
            "most_common_predicted_conditions": [],
        }