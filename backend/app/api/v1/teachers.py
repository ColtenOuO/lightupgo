from datetime import datetime, timezone

from beanie import PydanticObjectId
from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.deps import get_current_admin
from app.models.admin_user import AdminUser
from app.models.teacher import Teacher
from app.schemas.teacher import TeacherCreate, TeacherOut, TeacherUpdate

router = APIRouter()


def _to_out(t: Teacher) -> TeacherOut:
    return TeacherOut(id=str(t.id), **t.model_dump(exclude={"id", "revision_id"}))


@router.get("", response_model=list[TeacherOut])
async def list_teachers(visible_only: bool = Query(True)):
    query: dict = {"visible": True} if visible_only else {}
    teachers = await Teacher.find(query).sort("+order", "+created_at").to_list()
    return [_to_out(t) for t in teachers]


@router.get("/{teacher_id}", response_model=TeacherOut)
async def get_teacher(teacher_id: PydanticObjectId):
    t = await Teacher.get(teacher_id)
    if t is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Teacher not found")
    return _to_out(t)


@router.post("", response_model=TeacherOut, status_code=status.HTTP_201_CREATED)
async def create_teacher(
    payload: TeacherCreate,
    _: AdminUser = Depends(get_current_admin),
):
    if await Teacher.find_one(Teacher.slug == payload.slug):
        raise HTTPException(
            status.HTTP_409_CONFLICT, detail=f"Slug '{payload.slug}' already exists"
        )
    t = Teacher(**payload.model_dump())
    await t.insert()
    return _to_out(t)


@router.patch("/{teacher_id}", response_model=TeacherOut)
async def update_teacher(
    teacher_id: PydanticObjectId,
    payload: TeacherUpdate,
    _: AdminUser = Depends(get_current_admin),
):
    t = await Teacher.get(teacher_id)
    if t is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Teacher not found")

    updates = payload.model_dump(exclude_unset=True)
    if "slug" in updates and updates["slug"] != t.slug:
        if await Teacher.find_one(Teacher.slug == updates["slug"]):
            raise HTTPException(
                status.HTTP_409_CONFLICT,
                detail=f"Slug '{updates['slug']}' already exists",
            )
    for field, value in updates.items():
        setattr(t, field, value)
    t.updated_at = datetime.now(timezone.utc)
    await t.save()
    return _to_out(t)


@router.delete("/{teacher_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_teacher(
    teacher_id: PydanticObjectId,
    _: AdminUser = Depends(get_current_admin),
):
    t = await Teacher.get(teacher_id)
    if t is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Teacher not found")
    await t.delete()
