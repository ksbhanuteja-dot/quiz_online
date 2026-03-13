from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import auth, instructor_quiz, instructor_analytics, student_quiz, student_dashboard
from app.database import engine, Base

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Premium Online Quizzing API",
    description="A high-performance backend for real-time assessments.",
    version="1.0.0"
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
