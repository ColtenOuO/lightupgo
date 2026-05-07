"""建立第一個管理者帳號。

使用方式（在 backend/ 資料夾下）：
    python -m scripts.create_admin <username> <password>
"""
import asyncio
import sys

from app.core.database import close_db, init_db
from app.core.security import hash_password
from app.models.admin_user import AdminUser


async def main(username: str, password: str) -> None:
    await init_db()
    try:
        existing = await AdminUser.find_one(AdminUser.username == username)
        if existing:
            print(f"Admin '{username}' already exists.")
            return
        await AdminUser(
            username=username, password_hash=hash_password(password)
        ).insert()
        print(f"Created admin '{username}'.")
    finally:
        await close_db()


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python -m scripts.create_admin <username> <password>")
        sys.exit(1)
    asyncio.run(main(sys.argv[1], sys.argv[2]))
