from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import engine, Base
from app.api import (
    auth,
    courses,
    lessons,
    quizzes,
    submissions,
    execute,
    progress,
    comments,
    seed,
)

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(courses.router)
app.include_router(lessons.router)
app.include_router(quizzes.router)
app.include_router(submissions.router)
app.include_router(execute.router)
app.include_router(progress.router)
app.include_router(comments.router)
app.include_router(seed.router)


@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": settings.APP_NAME, "version": settings.VERSION}
