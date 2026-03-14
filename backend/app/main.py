from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import auth, instructor, student
from app.database import engine, Base

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Premium Online Quizzing API",
    description="A high-performance backend for real-time assessments.",
    version="1.0.0"
)

# CORS Middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(instructor.router, prefix="/api/instructor", tags=["Instructor"])
app.include_router(student.router, prefix="/api/student", tags=["Student"])

@app.get("/")
def root():
    return {"message": "Welcome to the Online Quizzing Application API"}
