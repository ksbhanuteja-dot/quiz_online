from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import auth, instructor_quiz, instructor_analytics, student_quiz, student_dashboard
from app.database import engine, Base
from app.core.response_utils import error_response

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Premium Online Quizzing API",
    description="A high-performance backend for real-time assessments.",
    version="1.0.0"
)

# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content=error_response(f"An unexpected error occurred: {str(exc)}").dict()
    )

from fastapi import HTTPException
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content=error_response(exc.detail).dict()
    )

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(instructor_quiz.router, prefix="/instructor/quizzes", tags=["Instructor Quizzes"])
app.include_router(instructor_analytics.router, prefix="/instructor/analytics", tags=["Instructor Analytics"])
app.include_router(student_quiz.router, prefix="/student/quizzes", tags=["Student Quizzes"])
app.include_router(student_dashboard.router, prefix="/student/dashboard", tags=["Student Dashboard"])

@app.get("/")
def root():
    return {"message": "Welcome to the Online Quizzing Application API"}
