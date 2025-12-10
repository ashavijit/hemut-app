from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import users, questions, websocket

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Hemut Q&A API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(questions.router)
app.include_router(websocket.router)

@app.get("/")
def root():
    return {"message": "Hemut Q&A API", "docs": "/docs"}

@app.get("/health")
def health():
    return {"status": "ok"}
