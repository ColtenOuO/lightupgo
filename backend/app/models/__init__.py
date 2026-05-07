from app.models.admin_user import AdminUser
from app.models.blog_post import BlogPost
from app.models.card import Card
from app.models.course import Course
from app.models.gallery_item import GalleryItem
from app.models.teacher import Teacher

all_documents = [AdminUser, Card, Course, Teacher, GalleryItem, BlogPost]

__all__ = [
    "AdminUser",
    "BlogPost",
    "Card",
    "Course",
    "GalleryItem",
    "Teacher",
    "all_documents",
]
