import asyncio
from app.core.database import AsyncSessionLocal
from app.models.user import User
from sqlalchemy import select

async def main():
    async with AsyncSessionLocal() as session:
        res = await session.execute(select(User))
        users = res.scalars().all()
        print("Registered Users:")
        for u in users:
            print(f"- Email: {u.email}, Role: {u.role}, Active: {u.is_active}")

if __name__ == "__main__":
    asyncio.run(main())
