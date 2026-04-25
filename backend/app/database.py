from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

client: AsyncIOMotorClient = None
db = None


async def connect_to_database():
    """Establish connection to MongoDB."""
    global client, db
    client = AsyncIOMotorClient(settings.MONGO_URI)
    db = client[settings.DB_NAME]

    # Create indexes for performance
    await db.users.create_index("email", unique=True)
    await db.assets.create_index("user_id")
    await db.assets.create_index("type")
    await db.assets.create_index("status")
    await db.transactions.create_index("asset_id")
    await db.transactions.create_index("user_id")
    await db.transactions.create_index("date")
    await db.budgets.create_index("user_id")
    await db.budgets.create_index("asset_id")
    await db.alerts.create_index([("user_id", 1), ("dismissed", 1)])

    print(f"✅ Conectado a MongoDB: {settings.DB_NAME}")


async def close_database_connection():
    """Close MongoDB connection."""
    global client
    if client:
        client.close()
        print("❌ Conexión a MongoDB cerrada")


def get_database():
    """Get database instance."""
    return db
