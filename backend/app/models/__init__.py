from app.models.admin_user import AdminUser
from app.models.card import Card

all_documents = [AdminUser, Card]

__all__ = ["AdminUser", "Card", "all_documents"]
