from fastapi import APIRouter

from app.api.v1 import (
    auth,
    blog,
    cards,
    courses,
    gallery,
    site_settings,
    teachers,
    upload,
)

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(site_settings.router, prefix="/settings", tags=["settings"])
api_router.include_router(cards.router, prefix="/cards", tags=["cards"])
api_router.include_router(courses.router, prefix="/courses", tags=["courses"])
api_router.include_router(teachers.router, prefix="/teachers", tags=["teachers"])
api_router.include_router(gallery.router, prefix="/gallery", tags=["gallery"])
api_router.include_router(blog.router, prefix="/blog", tags=["blog"])
api_router.include_router(upload.router, prefix="/upload", tags=["upload"])
