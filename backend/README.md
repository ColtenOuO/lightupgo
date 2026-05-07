# lightupgo backend

FastAPI + Beanie (MongoDB ODM) + JWT。

## 啟動 (本機開發)

```bash
# 1. 安裝依賴（建議用虛擬環境）
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# 2. 環境變數
cp .env.example .env
# 編輯 .env 填入 MONGO_URL 與 JWT_SECRET

# 3. 起 MongoDB（或用根目錄 docker compose up -d mongo）
docker run -d --name mongo -p 27017:27017 mongo:7

# 4. 建立第一個管理者
python -m scripts.create_admin admin yourpassword

# 5. 啟動 API
uvicorn app.main:app --reload
```

開啟 http://localhost:8000/docs 看互動式 API 文件。

## 目錄結構

```
backend/
├── app/
│   ├── main.py             FastAPI app 入口
│   ├── core/
│   │   ├── config.py       pydantic-settings 環境變數
│   │   ├── database.py     Motor + Beanie 初始化
│   │   ├── security.py     bcrypt 密碼、JWT 簽發/驗證
│   │   └── deps.py         get_current_admin 依賴
│   ├── models/             Beanie Document（MongoDB collections）
│   ├── schemas/            Pydantic request/response models
│   └── api/v1/             REST 路由
└── scripts/
    └── create_admin.py     CLI 建立管理者帳號
```
