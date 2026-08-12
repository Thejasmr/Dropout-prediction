import asyncio
import os
import sys

# Ensure backend directory is in python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from passlib.context import CryptContext
from sqlalchemy import select
from app.core.database import AsyncSessionLocal
from app.models.user import User

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


async def seed_admin():
    admin_email = "admin@dte.rajasthan.gov.in"
    admin_password = os.getenv("ADMIN_PASSWORD", "AdminPassword123!")

    async with AsyncSessionLocal() as session:
        # Check if admin already exists
        result = await session.execute(select(User).where(User.email == admin_email))
        existing_user = result.scalar_one_or_none()

        if existing_user:
            print(f"Admin user '{admin_email}' already exists. Skipping seed.")
            return

        hashed_password = get_password_hash(admin_password)
        admin_user = User(
            email=admin_email,
            hashed_password=hashed_password,
            full_name="DTE System Administrator",
            role="admin",
            is_active=True
        )

        session.add(admin_user)
        await session.commit()
        print(f"Successfully seeded admin user '{admin_email}' with role 'admin'.")


if __name__ == "__main__":
    asyncio.run(seed_admin())
