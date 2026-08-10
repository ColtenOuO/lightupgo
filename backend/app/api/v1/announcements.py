from datetime import datetime, timezone

from beanie import PydanticObjectId
from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.deps import get_current_admin
from app.models.admin_user import AdminUser
from app.models.announcement import Announcement
from app.schemas.announcement import (
    AnnouncementCreate,
    AnnouncementOut,
    AnnouncementUpdate,
)

router = APIRouter()


def _to_out(a: Announcement) -> AnnouncementOut:
    return AnnouncementOut(id=str(a.id), **a.model_dump(exclude={"id", "revision_id"}))


@router.get("", response_model=list[AnnouncementOut])
async def list_announcements(
    published_only: bool = Query(True),
    limit: int = Query(50, ge=1, le=200),
):
    """公開端點：前台抓未過期、已發佈的公告，pinned 優先 + 依 published_at desc。"""
    query: dict = {}
    if published_only:
        query["published"] = True

    items = await Announcement.find(query).to_list()
    now = datetime.now(timezone.utc)

    def is_visible(a: Announcement) -> bool:
        if published_only:
            # published_at 在未來 → 還沒發佈
            if a.published_at is not None and a.published_at.replace(tzinfo=timezone.utc) > now:
                return False
            # expires_at 已過 → 不顯示
            if a.expires_at is not None and a.expires_at.replace(tzinfo=timezone.utc) < now:
                return False
        return True

    items = [a for a in items if is_visible(a)]
    items.sort(
        key=lambda a: (
            not a.pinned,                              # pinned 優先（False < True，所以 not 來反轉）
            -(a.published_at or a.created_at).timestamp(),  # 新到舊
            a.order,
        )
    )
    return [_to_out(a) for a in items[:limit]]


@router.get("/all", response_model=list[AnnouncementOut])
async def list_all(_: AdminUser = Depends(get_current_admin)):
    """後台：含未發佈、已過期的全部公告。"""
    items = await Announcement.find_all().sort("-pinned", "-created_at").to_list()
    return [_to_out(a) for a in items]


@router.get("/{ann_id}", response_model=AnnouncementOut)
async def get_one(ann_id: PydanticObjectId):
    a = await Announcement.get(ann_id)
    if a is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Announcement not found")
    return _to_out(a)


@router.post("", response_model=AnnouncementOut, status_code=status.HTTP_201_CREATED)
async def create(
    payload: AnnouncementCreate,
    _: AdminUser = Depends(get_current_admin),
):
    a = Announcement(**payload.model_dump())
    await a.insert()
    return _to_out(a)


@router.patch("/{ann_id}", response_model=AnnouncementOut)
async def update(
    ann_id: PydanticObjectId,
    payload: AnnouncementUpdate,
    _: AdminUser = Depends(get_current_admin),
):
    a = await Announcement.get(ann_id)
    if a is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Announcement not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(a, field, value)
    a.updated_at = datetime.now(timezone.utc)
    await a.save()
    return _to_out(a)


@router.delete("/{ann_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete(
    ann_id: PydanticObjectId,
    _: AdminUser = Depends(get_current_admin),
):
    a = await Announcement.get(ann_id)
    if a is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Announcement not found")
    await a.delete()
