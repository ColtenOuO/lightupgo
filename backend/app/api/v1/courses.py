from datetime import datetime, timezone

from beanie import PydanticObjectId
from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.deps import get_current_admin
from app.models.admin_user import AdminUser
from app.models.course import Course
from app.schemas.course import CourseCreate, CourseOut, CourseUpdate

router = APIRouter()


def _to_out(c: Course) -> CourseOut:
    return CourseOut(id=str(c.id), **c.model_dump(exclude={"id", "revision_id"}))


@router.get("", response_model=list[CourseOut])
async def list_courses(
    level: str | None = Query(None),
    visible_only: bool = Query(True),
):
    query: dict = {}
    if level is not None:
        query["level"] = level
    if visible_only:
        query["visible"] = True
    courses = await Course.find(query).sort("+order", "+created_at").to_list()
    return [_to_out(c) for c in courses]


@router.get("/{course_id}", response_model=CourseOut)
async def get_course(course_id: PydanticObjectId):
    course = await Course.get(course_id)
    if course is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Course not found")
    return _to_out(course)


@router.post("", response_model=CourseOut, status_code=status.HTTP_201_CREATED)
async def create_course(
    payload: CourseCreate,
    _: AdminUser = Depends(get_current_admin),
):
    if await Course.find_one(Course.slug == payload.slug):
        raise HTTPException(
            status.HTTP_409_CONFLICT, detail=f"Slug '{payload.slug}' already exists"
        )
    course = Course(**payload.model_dump())
    await course.insert()
    return _to_out(course)


@router.patch("/{course_id}", response_model=CourseOut)
async def update_course(
    course_id: PydanticObjectId,
    payload: CourseUpdate,
    _: AdminUser = Depends(get_current_admin),
):
    course = await Course.get(course_id)
    if course is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Course not found")

    updates = payload.model_dump(exclude_unset=True)
    if "slug" in updates and updates["slug"] != course.slug:
        if await Course.find_one(Course.slug == updates["slug"]):
            raise HTTPException(
                status.HTTP_409_CONFLICT,
                detail=f"Slug '{updates['slug']}' already exists",
            )
    for field, value in updates.items():
        setattr(course, field, value)
    course.updated_at = datetime.now(timezone.utc)
    await course.save()
    return _to_out(course)


@router.delete("/{course_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_course(
    course_id: PydanticObjectId,
    _: AdminUser = Depends(get_current_admin),
):
    course = await Course.get(course_id)
    if course is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Course not found")
    await course.delete()
