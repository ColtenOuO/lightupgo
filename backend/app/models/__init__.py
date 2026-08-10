from app.models.admin_user import AdminUser
from app.models.announcement import Announcement
from app.models.blog_post import BlogPost
from app.models.card import Card
from app.models.course import Course
from app.models.gallery_item import GalleryItem
from app.models.site_settings import SiteSettings
from app.models.teacher import Teacher

all_documents = [
    AdminUser,
    Announcement,
    Card,
    Course,
    Teacher,
    GalleryItem,
    BlogPost,
    SiteSettings,
]

__all__ = [
    "AdminUser",
    "Announcement",
    "BlogPost",
    "Card",
    "Course",
    "GalleryItem",
    "SiteSettings",
    "Teacher",
    "all_documents",
]
