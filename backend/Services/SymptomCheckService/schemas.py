from typing import List, Optional
from pydantic import BaseModel, Field, model_validator

class SymptomRequest(BaseModel):
    user_id: str
    symptoms: Optional[List[str]] = None
    description: Optional[str] = None

    @model_validator(mode="after")
    def require_symptoms_or_description(self):
        if not self.symptoms and not self.description:
            raise ValueError("Either 'symptoms' or 'description' must be provided")
        return self

class SymptomResponse(BaseModel):
    analysis_id: Optional[str] = None
    predicted_condition: str
    confidence: float = Field(..., ge=0, le=1, description="Confidence between 0 and 1")
    recommended_specialty: str
    ai_feedback: str


class AnalysisFeedbackRequest(BaseModel):
    was_accurate: bool