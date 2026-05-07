from datetime import datetime, timezone

from beanie import PydanticObjectId
from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.deps import get_current_admin
from app.models.admin_user import AdminUser
from app.models.blog_post import BlogPost
from app.schemas.blog_post import BlogPostCreate, BlogPostOut, BlogPostUpdate

router = APIRouter()


def _to_out(p: BlogPost) -> BlogPostOut:
    return BlogPostOut(id=str(p.id), **p.model_dump(exclude={"id", "revision_id"}))


@router.get("", response_model=list[BlogPostOut])
async def list_posts(
    tag: str | None = Query(None),
    published_only: bool = Query(True),
    limit: int = Query(50, ge=1, le=200),
):
    query: dict = {}
    if tag is not None:
        query["tags"] = tag
    if published_only:
        query["published"] = True
    posts = (
        await BlogPost.find(query)
        .sort("-published_at", "-created_at")
        .limit(limit)
        .to_list()
    )
    return [_to_out(p) for p in posts]


@router.get("/all", response_model=list[BlogPostOut])
async def list_all_posts(_: AdminUser = Depends(get_current_admin)):
    posts = await BlogPost.find_all().sort("-created_at").to_list()
    return [_to_out(p) for p in posts]


@router.get("/by-slug/{slug}", response_model=BlogPostOut)
async def get_by_slug(slug: str):
    post = await BlogPost.find_one(BlogPost.slug == slug, BlogPost.published == True)  # noqa: E712
    if post is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Post not found")
    return _to_out(post)


@router.get("/{post_id}", response_model=BlogPostOut)
async def get_post(post_id: PydanticObjectId):
    post = await BlogPost.get(post_id)
    if post is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Post not found")
    return _to_out(post)


@router.post("", response_model=BlogPostOut, status_code=status.HTTP_201_CREATED)
async def create_post(
    payload: BlogPostCreate,
    _: AdminUser = Depends(get_current_admin),
):
    if await BlogPost.find_one(BlogPost.slug == payload.slug):
        raise HTTPException(
            status.HTTP_409_CONFLICT, detail=f"Slug '{payload.slug}' already exists"
        )
    data = payload.model_dump()
    if data.get("published") and data.get("published_at") is None:
        data["published_at"] = datetime.now(timezone.utc)
    post = BlogPost(**data)
    await post.insert()
    return _to_out(post)


@router.patch("/{post_id}", response_model=BlogPostOut)
async def update_post(
    post_id: PydanticObjectId,
    payload: BlogPostUpdate,
    _: AdminUser = Depends(get_current_admin),
):
    post = await BlogPost.get(post_id)
    if post is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Post not found")

    updates = payload.model_dump(exclude_unset=True)
    if "slug" in updates and updates["slug"] != post.slug:
        if await BlogPost.find_one(BlogPost.slug == updates["slug"]):
            raise HTTPException(
                status.HTTP_409_CONFLICT,
                detail=f"Slug '{updates['slug']}' already exists",
            )
    if updates.get("published") and post.published_at is None and "published_at" not in updates:
        updates["published_at"] = datetime.now(timezone.utc)

    for field, value in updates.items():
        setattr(post, field, value)
    post.updated_at = datetime.now(timezone.utc)
    await post.save()
    return _to_out(post)


@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_post(
    post_id: PydanticObjectId,
    _: AdminUser = Depends(get_current_admin),
):
    post = await BlogPost.get(post_id)
    if post is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Post not found")
    await post.delete()
