import json
from typing import Optional, Any
import redis.asyncio as aioredis
from app.core.config import settings

_redis_client: Optional[aioredis.Redis] = None


async def get_redis_client() -> Optional[aioredis.Redis]:
    global _redis_client
    if _redis_client is None:
        try:
            redis_host = settings.REDIS_HOST
            redis_port = settings.REDIS_PORT
            _redis_client = aioredis.Redis(
                host=redis_host, port=redis_port, db=0, decode_responses=True
            )
        except Exception:
            _redis_client = None
    return _redis_client


async def cache_get(key: str) -> Optional[Any]:
    try:
        client = await get_redis_client()
        if client is None:
            return None
        data = await client.get(key)
        if data:
            return json.loads(data)
    except Exception:
        pass
    return None


async def cache_set(key: str, value: Any, ttl: int = 3600) -> bool:
    try:
        client = await get_redis_client()
        if client is None:
            return False
        await client.set(key, json.dumps(value, default=str), ex=ttl)
        return True
    except Exception:
        return False


async def cache_delete(key: str) -> bool:
    try:
        client = await get_redis_client()
        if client is None:
            return False
        await client.delete(key)
        return True
    except Exception:
        return False


async def invalidate_student_cache(student_id: str):
    await cache_delete(f"student:{student_id}")
    await cache_delete(f"student_risk:{student_id}")
    await cache_delete("dashboard_summary")
