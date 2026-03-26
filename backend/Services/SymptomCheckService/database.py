from dotenv import load_dotenv
import os
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

load_dotenv()
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")

client: AsyncIOMotorClient = AsyncIOMotorClient(MONGO_URI)

def get_database(name: str = "symptom-checker") -> AsyncIOMotorDatabase:
    return client[name]

def close_client() -> None:
    client.close()