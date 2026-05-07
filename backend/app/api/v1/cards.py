from datetime import datetime, timezone

from beanie import PydanticObjectId
from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.deps import get_current_admin
from app.models.admin_user import AdminUser
from app.models.card import Card
from app.schemas.card import (
    CardCreate,
    CardOut,
    CardReorderItem,
    CardUpdate,
)

router = APIRouter()


def _to_out(card: Card) -> CardOut:
    return CardOut(
        id=str(card.id),
        slug=card.slug,
        page=card.page,
        section=card.section,
        order=card.order,
        title=card.title,
        subtitle=card.subtitle,
        body=card.body,
        image_url=card.image_url,
        icon=card.icon,
        cta_text=card.cta_text,
        cta_url=card.cta_url,
        extras=card.extras,
        visible=card.visible,
        created_at=card.created_at,
        updated_at=card.updated_at,
    )


@router.get("", response_model=list[CardOut])
async def list_cards(
    page: str | None = Query(None, description="依頁面過濾，如 'home'"),
    section: str | None = Query(None, description="依區塊過濾，如 'hero'"),
    visible_only: bool = Query(True, description="預設只回傳 visible=True"),
):
    """公開端點：前台依 page/section 抓卡片。"""
    query: dict = {}
    if page is not None:
        query["page"] = page
    if section is not None:
        query["section"] = section
    if visible_only:
        query["visible"] = True

    cards = await Card.find(query).sort("+order", "+created_at").to_list()
    return [_to_out(c) for c in cards]


@router.get("/all", response_model=list[CardOut])
async def list_all_cards(_: AdminUser = Depends(get_current_admin)):
    """後台端點：取得全部卡片（含 hidden）給管理介面顯示。"""
    cards = await Card.find_all().sort("+page", "+section", "+order").to_list()
    return [_to_out(c) for c in cards]


@router.get("/{card_id}", response_model=CardOut)
async def get_card(card_id: PydanticObjectId):
    card = await Card.get(card_id)
    if card is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Card not found")
    return _to_out(card)


@router.post("", response_model=CardOut, status_code=status.HTTP_201_CREATED)
async def create_card(
    payload: CardCreate,
    _: AdminUser = Depends(get_current_admin),
):
    if await Card.find_one(Card.slug == payload.slug):
        raise HTTPException(
            status.HTTP_409_CONFLICT, detail=f"Slug '{payload.slug}' already exists"
        )
    card = Card(**payload.model_dump())
    await card.insert()
    return _to_out(card)


@router.patch("/{card_id}", response_model=CardOut)
async def update_card(
    card_id: PydanticObjectId,
    payload: CardUpdate,
    _: AdminUser = Depends(get_current_admin),
):
    card = await Card.get(card_id)
    if card is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Card not found")

    updates = payload.model_dump(exclude_unset=True)
    if "slug" in updates and updates["slug"] != card.slug:
        if await Card.find_one(Card.slug == updates["slug"]):
            raise HTTPException(
                status.HTTP_409_CONFLICT,
                detail=f"Slug '{updates['slug']}' already exists",
            )

    for field, value in updates.items():
        setattr(card, field, value)
    card.updated_at = datetime.now(timezone.utc)
    await card.save()
    return _to_out(card)


@router.delete("/{card_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_card(
    card_id: PydanticObjectId,
    _: AdminUser = Depends(get_current_admin),
):
    card = await Card.get(card_id)
    if card is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Card not found")
    await card.delete()


@router.post("/reorder", status_code=status.HTTP_204_NO_CONTENT)
async def reorder_cards(
    items: list[CardReorderItem],
    _: AdminUser = Depends(get_current_admin),
):
    """批次調整 order。前端拖曳排序後一次送上來。"""
    now = datetime.now(timezone.utc)
    for item in items:
        try:
            obj_id = PydanticObjectId(item.id)
        except Exception:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST, detail=f"Invalid id: {item.id}"
            )
        card = await Card.get(obj_id)
        if card is None:
            continue
        card.order = item.order
        card.updated_at = now
        await card.save()
