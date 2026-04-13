import os
from pathlib import Path

from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

# Always load the service-local .env no matter where uvicorn is started from.
_ENV_PATH = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=_ENV_PATH, override=False)

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
MONGO_DB = os.getenv("MONGO_DB", "chatbot")

client: AsyncIOMotorClient = AsyncIOMotorClient(
    MONGO_URI,
    serverSelectionTimeoutMS=5000,
)


def get_database(name: str | None = None) -> AsyncIOMotorDatabase:
    return client[name or MONGO_DB]


def close_client() -> None:
    client.close()
