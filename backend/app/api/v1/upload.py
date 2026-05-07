from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status

from app.core.deps import get_current_admin
from app.core.storage import MAX_BYTES, build_target_path
from app.models.admin_user import AdminUser

router = APIRouter()


@router.post("/image")
async def upload_image(
    file: UploadFile = File(...),
    _: AdminUser = Depends(get_current_admin),
):
    """管理者上傳圖片，回傳可給前台 image_url 直接使用的 URL。"""
    try:
        target, url = build_target_path(file.filename)
    except ValueError:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file type. Allowed: jpg, jpeg, png, webp, gif",
        )

    size = 0
    chunk_size = 64 * 1024
    try:
        with target.open("wb") as out:
            while True:
                chunk = await file.read(chunk_size)
                if not chunk:
                    break
                size += len(chunk)
                if size > MAX_BYTES:
                    raise HTTPException(
                        status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                        detail=f"File too large (max {MAX_BYTES // 1024 // 1024}MB)",
                    )
                out.write(chunk)
    except HTTPException:
        target.unlink(missing_ok=True)
        raise

    return {"url": url, "size": size, "filename": target.name}
