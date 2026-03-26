from typing import List, Optional
from pydantic import BaseModel, Field, root_validator, confloat

class SymptomRequest(BaseModel):
    user_id: str
    symptoms: Optional[List[str]] = None
    description: Optional[str] = None

    @root_validator
    def require_symptoms_or_description(cls, values):
        if not values.get("symptoms") and not values.get("description"):
            raise ValueError("Either 'symptoms' or 'description' must be provided")
        return values


class SymptomResponse(BaseModel):
    predicted_condition: str
    confidence: confloat(ge=0, le=1) = Field(..., description="Confidence between 0 and 1")
