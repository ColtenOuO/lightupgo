# lightupgo frontend

Next.js 14 (App Router) + TypeScript + Tailwind CSS + 自製 shadcn 風格元件。

## 啟動 (本機開發)

```bash
# 1. 安裝依賴
npm install

# 2. 環境變數
cp .env.example .env.local
# NEXT_PUBLIC_API_URL=http://localhost:8000

# 3. 啟動
npm run dev
```

開啟 http://localhost:3000

## 目錄結構

```
frontend/
├── app/
│   ├── layout.tsx              根 layout，載字型 + 全站 SEO meta
│   ├── globals.css             Tailwind base + 主題樣式
│   └── (public)/               對外公開頁面（共享 nav + footer）
│       ├── layout.tsx
│       ├── page.tsx            首頁（從 FastAPI 抓 cards/courses）
│       └── register/page.tsx   報名（嵌入後台設定的表單 URL）
├── components/
│   ├── ui/                     基礎元件（Button、Card）
│   └── public/                 前台元件（Nav、Footer）
├── lib/
│   ├── api.ts                  FastAPI client（伺服器/瀏覽器自動切 base URL）
│   ├── types.ts                API 回傳的 TypeScript 型別
│   └── utils.ts                cn() helper
├── tailwind.config.ts          糖果色 theme（sun / coral / mint / sky2 / cream / ink）
└── next.config.mjs
```

## 配色

- `sun` 亮黃 #FFD93D — 主視覺、CTA 強調背景
- `coral` 珊瑚紅 #FF6B6B — 主 CTA 按鈕、標題重點
- `mint` 薄荷綠 #4ECDC4 — 次要按鈕、徽章
- `sky2` 天藍 #74C0FC — 連結、點綴
- `cream` 米白 #FFF8E1 — 背景
- `ink` 深藍紫 #2D2A4A — 文字主色

## 與後端串接

Server Component 直接 `await apiGet<T>('/api/v1/...')`。容器內走
`INTERNAL_API_URL`（http://backend:8000），瀏覽器與圖片走
`NEXT_PUBLIC_API_URL`（對外）。

預設 ISR 60 秒（可在 `apiGet` 第二個參數的 `revalidate` 調整）。
