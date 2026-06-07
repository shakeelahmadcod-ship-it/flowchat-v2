from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import engine, Base
from app.api import auth, pages
import app.models

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="FlowChat API",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(pages.router)

@app.get("/")
def root():
    return {"message": "FlowChat API v2.0 is running!"}

@app.get("/health")
def health():
    return {"status": "ok", "version": "2.0.0"}