from datetime import datetime
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from bson import ObjectId

from chat_service import ChatbotService
from database import close_client, get_database
from schemas import (
    ChatConversationCreate,
    ChatConversationUpdate,
    ChatMessageCreate,
    ChatMessageUpdate,
)
from pathlib import Path
import traceback
from pymongo.errors import PyMongoError

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

chat_service = ChatbotService()
db = get_database()

_LOG_PATH = Path(__file__).resolve().parent / "chatbot_errors.log"

def _log_error(msg: str) -> None:
    try:
        with open(_LOG_PATH, "a", encoding="utf-8") as f:
            f.write(msg + "\n")
    except Exception as ex:
        # Best-effort logging only: never raise from logging path.
        print(f"WARNING: failed to write chatbot error log: {ex}")


def _db_unavailable(ex: Exception) -> HTTPException:
    _log_error(f"database unavailable: {ex}\n{traceback.format_exc()}")
    return HTTPException(status_code=503, detail="Chatbot database unavailable. Check MONGO_URI/TLS and network.")


@app.on_event("startup")
async def startup_event():
    try:
        await db.command("ping")
        print(f"INFO: MongoDB connected (database='{db.name}')")
    except Exception as ex:
        print(f"ERROR: MongoDB connection failed: {ex}")


@app.on_event("shutdown")
async def shutdown_event():
    close_client()


def _parse_object_id(raw_id: str) -> ObjectId:
    if not ObjectId.is_valid(raw_id):
        raise HTTPException(status_code=400, detail="Invalid identifier")
    return ObjectId(raw_id)


def _serialize_conversation(doc):
    doc["id"] = str(doc.pop("_id"))
    return doc


def _serialize_message(doc):
    doc["id"] = str(doc.pop("_id"))
    doc["conversation_id"] = str(doc["conversation_id"])
    if doc.get("reply_to_message_id") is not None:
        doc["reply_to_message_id"] = str(doc["reply_to_message_id"])
    return doc


async def _load_history(conversation_id: ObjectId):
    cursor = db["messages"].find({"conversation_id": conversation_id}).sort("created_at", 1)
    messages = await cursor.to_list(length=100)
    return messages


async def _conversation_or_404(conversation_id: str):
    object_id = _parse_object_id(conversation_id)
    conversation = await db["conversations"].find_one({"_id": object_id})
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conversation


@app.get("/api/chatbot/health")
async def health():
    return {"service": "ChatbotService", "status": "Running", "timestamp": datetime.utcnow()}


@app.post("/api/chatbot/conversations")
async def create_conversation(payload: ChatConversationCreate):
    try:
        title = payload.title
        if not title:
            if isinstance(payload.diagnosis_context, dict):
                title = payload.diagnosis_context.get("predicted_condition") or payload.diagnosis_context.get("title")
            title = title or "CareLink Chat"

        doc = {
            "user_id": payload.user_id,
            "title": title,
            "diagnosis_context": payload.diagnosis_context,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        }

        result = await db["conversations"].insert_one(doc)
        doc["_id"] = result.inserted_id
        doc["message_count"] = 0
        return _serialize_conversation(doc)
    except PyMongoError as ex:
        raise _db_unavailable(ex)
    except Exception as ex:
        tb = traceback.format_exc()
        _log_error(f"create_conversation failed: {ex}\n{tb}")
        raise HTTPException(status_code=500, detail="Unable to create conversation")


@app.get("/api/chatbot/conversations")
async def list_conversations(user_id: str = Query(...)):
    try:
        cursor = db["conversations"].find({"user_id": user_id}).sort("updated_at", -1)
        conversations = await cursor.to_list(length=100)
        for conversation in conversations:
            conversation["message_count"] = await db["messages"].count_documents({"conversation_id": conversation["_id"]})
            _serialize_conversation(conversation)
        return conversations
    except PyMongoError as ex:
        raise _db_unavailable(ex)


@app.get("/api/chatbot/conversations/{conversation_id}")
async def get_conversation(conversation_id: str):
    try:
        conversation = await _conversation_or_404(conversation_id)
        conversation["message_count"] = await db["messages"].count_documents({"conversation_id": conversation["_id"]})
        return _serialize_conversation(conversation)
    except PyMongoError as ex:
        raise _db_unavailable(ex)


@app.put("/api/chatbot/conversations/{conversation_id}")
async def update_conversation(conversation_id: str, payload: ChatConversationUpdate):
    try:
        object_id = _parse_object_id(conversation_id)
        update_doc = {"updated_at": datetime.utcnow()}
        if payload.title is not None:
            update_doc["title"] = payload.title
        if payload.diagnosis_context is not None:
            update_doc["diagnosis_context"] = payload.diagnosis_context

        result = await db["conversations"].update_one({"_id": object_id}, {"$set": update_doc})
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Conversation not found")

        conversation = await db["conversations"].find_one({"_id": object_id})
        conversation["message_count"] = await db["messages"].count_documents({"conversation_id": object_id})
        return _serialize_conversation(conversation)
    except PyMongoError as ex:
        raise _db_unavailable(ex)


@app.delete("/api/chatbot/conversations/{conversation_id}")
async def delete_conversation(conversation_id: str):
    try:
        object_id = _parse_object_id(conversation_id)
        conversation_result = await db["conversations"].delete_one({"_id": object_id})
        if conversation_result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Conversation not found")

        message_result = await db["messages"].delete_many({"conversation_id": object_id})
        return {"deleted": True, "conversation_id": conversation_id, "deleted_messages": message_result.deleted_count}
    except PyMongoError as ex:
        raise _db_unavailable(ex)


@app.get("/api/chatbot/conversations/{conversation_id}/messages")
async def list_messages(conversation_id: str):
    try:
        object_id = _parse_object_id(conversation_id)
        cursor = db["messages"].find({"conversation_id": object_id}).sort("created_at", 1)
        messages = await cursor.to_list(length=200)
        return [_serialize_message(message) for message in messages]
    except PyMongoError as ex:
        raise _db_unavailable(ex)


@app.post("/api/chatbot/conversations/{conversation_id}/messages")
async def create_message(conversation_id: str, payload: ChatMessageCreate):
    conversation = await _conversation_or_404(conversation_id)
    object_id = conversation["_id"]
    history = await _load_history(object_id)

    user_doc = {
        "conversation_id": object_id,
        "user_id": payload.user_id,
        "sender": "user",
        "content": payload.content.strip(),
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "reply_to_message_id": None,
    }
    user_result = await db["messages"].insert_one(user_doc)
    user_doc["_id"] = user_result.inserted_id

    diagnosis_context = conversation.get("diagnosis_context")
    assistant_reply = await chat_service.generate_reply(payload.content.strip(), diagnosis_context, history + [user_doc])
    assistant_doc = {
        "conversation_id": object_id,
        "user_id": payload.user_id,
        "sender": "assistant",
        "content": assistant_reply,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "reply_to_message_id": user_result.inserted_id,
    }
    assistant_result = await db["messages"].insert_one(assistant_doc)
    assistant_doc["_id"] = assistant_result.inserted_id

    await db["conversations"].update_one(
        {"_id": object_id},
        {"$set": {"updated_at": datetime.utcnow()}},
    )

    return {
        "user_message": _serialize_message(user_doc),
        "assistant_message": _serialize_message(assistant_doc),
    }


@app.put("/api/chatbot/messages/{message_id}")
async def update_message(message_id: str, payload: ChatMessageUpdate):
    object_id = _parse_object_id(message_id)
    message = await db["messages"].find_one({"_id": object_id})
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    if message.get("sender") != "user":
        raise HTTPException(status_code=400, detail="Only user messages can be edited")

    await db["messages"].update_one(
        {"_id": object_id},
        {"$set": {"content": payload.content.strip(), "updated_at": datetime.utcnow()}},
    )

    conversation = await db["conversations"].find_one({"_id": message["conversation_id"]})
    history = await _load_history(message["conversation_id"])
    assistant_reply = await chat_service.generate_reply(payload.content.strip(), conversation.get("diagnosis_context"), history)

    assistant_message = await db["messages"].find_one({"reply_to_message_id": object_id})
    if assistant_message:
        await db["messages"].update_one(
            {"_id": assistant_message["_id"]},
            {"$set": {"content": assistant_reply, "updated_at": datetime.utcnow()}},
        )
        assistant_message["content"] = assistant_reply
        assistant_message["updated_at"] = datetime.utcnow()
        assistant_message["conversation_id"] = message["conversation_id"]
        assistant_message["sender"] = "assistant"
    else:
        assistant_doc = {
            "conversation_id": message["conversation_id"],
            "user_id": message["user_id"],
            "sender": "assistant",
            "content": assistant_reply,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "reply_to_message_id": object_id,
        }
        assistant_result = await db["messages"].insert_one(assistant_doc)
        assistant_message = assistant_doc
        assistant_message["_id"] = assistant_result.inserted_id

    updated_message = await db["messages"].find_one({"_id": object_id})
    return {
        "message": _serialize_message(updated_message),
        "assistant_message": _serialize_message(assistant_message),
    }


@app.delete("/api/chatbot/messages/{message_id}")
async def delete_message(message_id: str):
    object_id = _parse_object_id(message_id)
    message = await db["messages"].find_one({"_id": object_id})
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")

    result = await db["messages"].delete_one({"_id": object_id})
    if message.get("sender") == "user":
        await db["messages"].delete_many({"reply_to_message_id": object_id})

    if message.get("conversation_id"):
        await db["conversations"].update_one(
            {"_id": message["conversation_id"]},
            {"$set": {"updated_at": datetime.utcnow()}},
        )

    return {"deleted": True, "message_id": message_id, "deleted_count": result.deleted_count}
