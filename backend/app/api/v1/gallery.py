from datetime import datetime, timezone

from beanie import PydanticObjectId
from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.deps import get_current_admin
from app.models.admin_user import AdminUser
from app.models.gallery_item import GalleryItem
from app.schemas.gallery_item import (
    GalleryItemCreate,
    GalleryItemOut,
    GalleryItemUpdate,
)

router = APIRouter()


def _to_out(g: GalleryItem) -> GalleryItemOut:
    return GalleryItemOut(id=str(g.id), **g.model_dump(exclude={"id", "revision_id"}))


@router.get("", response_model=list[GalleryItemOut])
async def list_gallery(
    category: str | None = Query(None),
    visible_only: bool = Query(True),
):
    query: dict = {}
    if category is not None:
        query["category"] = category
    if visible_only:
        query["visible"] = True
    items = await GalleryItem.find(query).sort("+order", "-created_at").to_list()
    return [_to_out(i) for i in items]


@router.get("/{item_id}", response_model=GalleryItemOut)
async def get_item(item_id: PydanticObjectId):
    item = await GalleryItem.get(item_id)
    if item is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Gallery item not found")
    return _to_out(item)


@router.post("", response_model=GalleryItemOut, status_code=status.HTTP_201_CREATED)
async def create_item(
    payload: GalleryItemCreate,
    _: AdminUser = Depends(get_current_admin),
):
    item = GalleryItem(**payload.model_dump())
    await item.insert()
    return _to_out(item)


@router.patch("/{item_id}", response_model=GalleryItemOut)
async def update_item(
    item_id: PydanticObjectId,
    payload: GalleryItemUpdate,
    _: AdminUser = Depends(get_current_admin),
):
    item = await GalleryItem.get(item_id)
    if item is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Gallery item not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    item.updated_at = datetime.now(timezone.utc)
    await item.save()
    return _to_out(item)


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_item(
    item_id: PydanticObjectId,
    _: AdminUser = Depends(get_current_admin),
):
    item = await GalleryItem.get(item_id)
    if item is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Gallery item not found")
    await item.delete()
