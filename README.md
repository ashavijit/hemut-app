# Hemut Q&A Dashboard

Real-time Q&A dashboard where users can submit questions and see them pop up in real-time.

## Features

- **Real-time updates** via WebSocket
- **User authentication** (JWT-based)
- **Admin controls** - Mark questions answered, escalate
- **Guest access** - Anyone can ask and answer questions

## Tech Stack

- **Backend**: FastAPI + SQLite
- **Frontend**: Next.js + shadcn/ui
- **Real-time**: WebSocket

## Quick Start

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

- Backend: http://127.0.0.1:8000
- Frontend: http://localhost:3000
- API Docs: http://127.0.0.1:8000/docs

## Admin Credentials
See `backend/admin.creds.txt`
