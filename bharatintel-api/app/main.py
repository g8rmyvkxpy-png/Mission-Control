import structlog
import sentry_sdk
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager

from app.config import settings
from app.db.session import engine, Base
from app.cache.redis_client import init_redis, close_redis
from app.api.v1.router import v1_router

logger = structlog.get_logger()


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("bharatintel_starting", version=settings.APP_VERSION, env=settings.ENVIRONMENT)
    await init_redis()
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("bharatintel_ready", port=8000)
    yield
    await close_redis()
    await engine.dispose()
    logger.info("bharatintel_shutdown")


def create_app() -> FastAPI:
    if settings.SENTRY_DSN:
        sentry_sdk.init(dsn=settings.SENTRY_DSN, traces_sample_rate=0.1)

    app = FastAPI(
        title="BharatIntel API",
        description="India's AI-native data layer for AI agents. By PPventures.tech",
        version=settings.APP_VERSION,
        docs_url="/docs",
        redoc_url="/redoc",
        lifespan=lifespan,
    )

    # CORS — allow Vite frontend at 5174 + 5175
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.ALLOWED_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(v1_router, prefix="/v1")

    @app.get("/health", tags=["System"])
    async def health():
        return {
            "status": "ok",
            "version": settings.APP_VERSION,
            "environment": settings.ENVIRONMENT,
            "service": "BharatIntel API — PPventures.tech",
        }

    @app.get("/", tags=["System"])
    async def root():
        return {
            "name": "BharatIntel API",
            "version": settings.APP_VERSION,
            "docs": "/docs",
            "health": "/health",
            "modules": ["BizVerify", "LexIntel", "RegRadar", "BharatSearch"],
        }

    @app.exception_handler(Exception)
    async def global_exception_handler(req: Request, exc: Exception):
        logger.error("unhandled_exception", error=str(exc), path=str(req.url))
        return JSONResponse(status_code=500, content={
            "status": "error",
            "code": "INTERNAL_ERROR",
            "message": "Unexpected error. Our team has been notified.",
        })

    return app


app = create_app()
