from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import engine, Base
from app.api import auth, pages, keywords, messages, analytics, broadcasts
import app.models

Base.metadata.create_all(bind=engine)

app = FastAPI(title="FlowChat API", version="2.0.0")

# CORS — allow only the frontend and backend origins we expect
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://flowchat-v2.vercel.app",
        "https://flowchat-v2.up.railway.app",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(pages.router)
app.include_router(keywords.router)
app.include_router(messages.router)
app.include_router(analytics.router)
app.include_router(broadcasts.router)

@app.get("/")
def root():
    return {"message": "FlowChat API v2.0 is running!"}

@app.get("/health")
def health():
    return {"status": "ok", "version": "2.0.0"}