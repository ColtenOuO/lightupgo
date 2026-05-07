import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from app.core.security import decode_access_token
from app.models.admin_user import AdminUser

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


async def get_current_admin(token: str = Depends(oauth2_scheme)) -> AdminUser:
    creds_exc = HTTPException(
        status.HTTP_401_UNAUTHORIZED,
        detail="Invalid credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = decode_access_token(token)
    except jwt.PyJWTError:
        raise creds_exc

    username = payload.get("sub")
    if not username:
        raise creds_exc

    user = await AdminUser.find_one(AdminUser.username == username)
    if user is None or not user.is_active:
        raise creds_exc
    return user
