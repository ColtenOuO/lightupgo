from datetime import datetime, timezone

from fastapi import APIRouter, Depends

from app.core.deps import get_current_admin
from app.models.admin_user import AdminUser
from app.models.site_settings import GLOBAL_KEY, SiteSettings
from app.schemas.site_settings import SiteSettingsOut, SiteSettingsUpdate

router = APIRouter()


async def _get_or_create() -> SiteSettings:
    s = await SiteSettings.find_one(SiteSettings.key == GLOBAL_KEY)
    if s is None:
        s = SiteSettings()
        await s.insert()
    return s


def _to_out(s: SiteSettings) -> SiteSettingsOut:
    return SiteSettingsOut.model_validate(s.model_dump())


@router.get("", response_model=SiteSettingsOut)
async def get_settings():
    """公開端點：前台讀全站設定。"""
    s = await _get_or_create()
    return _to_out(s)


@router.patch("", response_model=SiteSettingsOut)
async def update_settings(
    payload: SiteSettingsUpdate,
    _: AdminUser = Depends(get_current_admin),
):
    s = await _get_or_create()
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(s, field, value)
    s.updated_at = datetime.now(timezone.utc)
    await s.save()
    return _to_out(s)
