import secrets
from datetime import datetime, timezone
from pathlib import Path

UPLOAD_DIR = Path("uploads")
ALLOWED_EXTS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
MAX_BYTES = 10 * 1024 * 1024  # 10 MB


def _safe_ext(filename: str | None) -> str | None:
    if not filename:
        return None
    ext = Path(filename).suffix.lower()
    return ext if ext in ALLOWED_EXTS else None


def build_target_path(filename: str | None) -> tuple[Path, str]:
    """回傳 (磁碟絕對／相對路徑, 對外可訪問的 URL 路徑)。"""
    ext = _safe_ext(filename)
    if ext is None:
        raise ValueError("Unsupported file type")
    now = datetime.now(timezone.utc)
    sub = f"{now.year:04d}/{now.month:02d}"
    name = f"{secrets.token_urlsafe(16)}{ext}"
    rel = f"{sub}/{name}"
    target = UPLOAD_DIR / sub / name
    target.parent.mkdir(parents=True, exist_ok=True)
    return target, f"/uploads/{rel}"
