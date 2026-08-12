import asyncio
from app.core.config import settings
from app.core.security import create_access_token, decode_token
from app.core.database import AsyncSessionLocal
from app.models.user import User
from sqlalchemy import select
from uuid import UUID

async def test():
    print("Settings secret key:", settings.SECRET_KEY)
    print("Settings algorithm:", settings.ALGORITHM)
    
    # Test token generation and decode
    token_data = {"sub": "4a3b2c1d-0000-0000-0000-000000000000", "role": "admin"}
    token = create_access_token(token_data)
    print("Generated token:", token)
    
    payload = decode_token(token)
    print("Decoded payload:", payload)
    
    # Test DB connection and query
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(User).limit(1))
        user = result.scalar_one_or_none()
        if user:
            print(f"Database connection works! Found user: {user.email} (ID: {user.id})")
        else:
            print("Database connection works, but no users found!")

if __name__ == "__main__":
    asyncio.run(test())
