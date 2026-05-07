# lightupgo

立光圍棋教室官方網站（[lightupgo.win](https://lightupgo.win/)）。

## 架構

```
lightupgo/
├── frontend/         Next.js 14 (App Router) + Tailwind + shadcn/ui
│                     公開前台 + /admin 管理後台共用一個專案
├── backend/          FastAPI + Beanie (MongoDB ODM) + Motor
│                     提供 REST API、JWT 驗證、卡片內容 CRUD、圖片上傳
└── docker-compose.yml  本機開發：mongo + backend + frontend
```

## 技術棧

- **前端**：Next.js (App Router)、Tailwind CSS、shadcn/ui、Framer Motion
- **後端**：FastAPI、Beanie ODM、Motor、PyJWT、bcrypt
- **資料庫**：MongoDB
- **部署**：Docker Compose

## 本機開發（之後補）

```bash
docker compose up -d mongo
# backend:  cd backend && uvicorn app.main:app --reload
# frontend: cd frontend && pnpm dev
```

## 目錄重點

- `backend/app/models/card.py`：通用卡片資料模型，後台可改前台所有卡片欄位
- `frontend/app/(public)/`：對外公開頁面（首頁、課程、相簿、部落格、報名）
- `frontend/app/admin/`：管理後台（登入、卡片管理、課程管理、相簿、部落格）
