import asyncio
from app.core.database import AsyncSessionLocal
from app.models.user import User
from app.core.security import get_password_hash
from sqlalchemy import select

async def seed_or_update_user(session, email, role, full_name, password):
    result = await session.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    
    hashed_password = get_password_hash(password)
    if user:
        user.hashed_password = hashed_password
        user.role = role
        user.full_name = full_name
        print(f"Updated user {email}")
    else:
        new_user = User(
            email=email,
            hashed_password=hashed_password,
            full_name=full_name,
            role=role,
            is_active=True
        )
        session.add(new_user)
        print(f"Created user {email}")

async def seed():
    print("Seeding database users...")
    async with AsyncSessionLocal() as session:
        await seed_or_update_user(session, "admin@edupulse.ai", "admin", "System Admin", "password123")
        await seed_or_update_user(session, "counsellor@edupulse.ai", "counsellor", "Lead Counsellor", "password123")
        await seed_or_update_user(session, "mentor@edupulse.ai", "mentor", "Student Mentor", "password123")
        await session.commit()
    print("Seeding complete!")

if __name__ == "__main__":
    asyncio.run(seed())
