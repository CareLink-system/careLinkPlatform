import os
from pathlib import Path

from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

# Always load the service-local .env no matter where uvicorn is started from.
_ENV_PATH = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=_ENV_PATH, override=False)

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
MONGO_DB = os.getenv("MONGO_DB", "chatbot")
MONGO_FALLBACK_URI = os.getenv("MONGO_FALLBACK_URI", "mongodb://localhost:27017")
MONGO_AUTO_FALLBACK = (os.getenv("MONGO_AUTO_FALLBACK", "true").strip().lower() == "true")

client: AsyncIOMotorClient = AsyncIOMotorClient(
    MONGO_URI,
    serverSelectionTimeoutMS=5000,
)
active_mongo_uri: str = MONGO_URI


async def ensure_connection() -> tuple[bool, str, str | None]:
    global client, active_mongo_uri
    try:
        await client.admin.command("ping")
        return True, active_mongo_uri, None
    except Exception as primary_error:
        if not MONGO_AUTO_FALLBACK or not MONGO_FALLBACK_URI or MONGO_FALLBACK_URI == active_mongo_uri:
            return False, active_mongo_uri, str(primary_error)

        try:
            fallback_client = AsyncIOMotorClient(
                MONGO_FALLBACK_URI,
                serverSelectionTimeoutMS=5000,
            )
            await fallback_client.admin.command("ping")
            try:
                client.close()
            except Exception:
                pass
            client = fallback_client
            active_mongo_uri = MONGO_FALLBACK_URI
            return True, active_mongo_uri, None
        except Exception as fallback_error:
            return False, active_mongo_uri, f"primary_error={primary_error}; fallback_error={fallback_error}"


def get_database(name: str | None = None) -> AsyncIOMotorDatabase:
    return client[name or MONGO_DB]


def close_client() -> None:
    client.close()
