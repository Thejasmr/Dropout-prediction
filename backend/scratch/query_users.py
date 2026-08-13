import asyncio
import os
import sys
sys.path.append(r"c:\Users\anand\OneDrive\Documents\dropout_prediction\backend")
os.chdir(r"c:\Users\anand\OneDrive\Documents\dropout_prediction\backend")

from app.core.database import AsyncSessionLocal
from app.models.user import User
from sqlalchemy import select

async def main():
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(User.email, User.role, User.full_name))
        users = result.all()
        print("Registered Users:")
        for idx, (email, role, name) in enumerate(users):
            print(f"{idx+1}. Email: {email} | Role: {role} | Name: {name}")

if __name__ == "__main__":
    asyncio.run(main())
