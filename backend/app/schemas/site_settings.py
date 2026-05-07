from datetime import datetime

from pydantic import BaseModel, Field


class SiteSettingsBase(BaseModel):
    site_name: str = "立光圍棋教室"
    tagline: str = "讓每一步都更有想法"
    hero_subtitle: str | None = None

    phone: str | None = None
    address: str | None = None
    business_hours: str | None = None

    register_form_url: str | None = None
    register_form_note: str | None = None

    meta_description: str | None = None
    meta_keywords: list[str] = Field(default_factory=list)

    facebook_url: str | None = None
    instagram_url: str | None = None
    line_id: str | None = None
    youtube_url: str | None = None


class SiteSettingsUpdate(BaseModel):
    site_name: str | None = None
    tagline: str | None = None
    hero_subtitle: str | None = None
    phone: str | None = None
    address: str | None = None
    business_hours: str | None = None
    register_form_url: str | None = None
    register_form_note: str | None = None
    meta_description: str | None = None
    meta_keywords: list[str] | None = None
    facebook_url: str | None = None
    instagram_url: str | None = None
    line_id: str | None = None
    youtube_url: str | None = None


class SiteSettingsOut(SiteSettingsBase):
    updated_at: datetime
