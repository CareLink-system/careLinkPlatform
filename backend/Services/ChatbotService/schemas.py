from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field, model_validator


class ChatConversationCreate(BaseModel):
    user_id: str
    title: Optional[str] = None
    diagnosis_context: Optional[Dict[str, Any]] = None


class ChatConversationUpdate(BaseModel):
    title: Optional[str] = None
    diagnosis_context: Optional[Dict[str, Any]] = None


class ChatMessageCreate(BaseModel):
    user_id: str
    content: str = Field(..., min_length=1)


class ChatMessageUpdate(BaseModel):
    content: str = Field(..., min_length=1)


class ChatMessageResponse(BaseModel):
    id: str
    conversation_id: str
    user_id: str
    sender: str
    content: str
    created_at: Any
    updated_at: Optional[Any] = None
    reply_to_message_id: Optional[str] = None


class ChatConversationResponse(BaseModel):
    id: str
    user_id: str
    title: str
    diagnosis_context: Optional[Dict[str, Any]] = None
    created_at: Any
    updated_at: Optional[Any] = None
    message_count: int = 0
