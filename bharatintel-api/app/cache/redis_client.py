import redis.asyncio as aioredis
from app.config import settings
import structlog

logger = structlog.get_logger()
redis_client = None


async def init_redis():
    global redis_client
    try:
        redis_client = aioredis.from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True,
        )
        await redis_client.ping()
        logger.info("redis_connected", url=settings.REDIS_URL)
    except Exception as e:
        logger.warning("redis_connection_failed_using_fallback", error=str(e))
        # Create a mock redis client that does nothing
        redis_client = MockRedisClient()
        logger.info("redis_mock_client_initialized")


async def close_redis():
    global redis_client
    if redis_client and hasattr(redis_client, 'close') and not isinstance(redis_client, MockRedisClient):
        await redis_client.close()


def get_redis_client():
    """Returns the redis client, initializing a mock if needed"""
    global redis_client
    if redis_client is None:
        redis_client = MockRedisClient()
    return redis_client


class MockRedisClient:
    """Fallback when Redis is unavailable"""
    async def get(self, key):
        return None
    async def setex(self, key, ttl, value):
        return True
    async def set(self, key, value):
        return True
    async def ping(self):
        return True
    def pipeline(self):
        return MockPipeline()
    async def close(self):
        pass


class MockPipeline:
    def incrby(self, key, value):
        return 0
    def expire(self, key, ttl):
        return True
    async def execute(self):
        return [0, True]
