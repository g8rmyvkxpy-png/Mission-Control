from fastapi import APIRouter
from app.api.v1 import admin, biz, lex, reg, search

v1_router = APIRouter()
v1_router.include_router(biz.router, prefix="/biz")
v1_router.include_router(lex.router, prefix="/lex")
v1_router.include_router(reg.router, prefix="/reg")
v1_router.include_router(search.router, prefix="/search")
v1_router.include_router(admin.router, prefix="/admin")
