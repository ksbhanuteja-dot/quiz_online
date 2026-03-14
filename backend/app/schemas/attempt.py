from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class AnswerSubmit(BaseModel):
    question_id: int
    selected_option_id: int

class AttemptSubmit(BaseModel):
    answers: List[AnswerSubmit]

class AnswerResponse(BaseModel):
    id: int
    question_id: int
    selected_option_id: int

    class Config:
        from_attributes = True

class AttemptResponse(BaseModel):
    id: int
    attemptId: int = Field(validation_alias="id")
    student_id: int
    quiz_id: int
    score: int
    status: str
    started_at: datetime
    completed_at: Optional[datetime] = None
    answers: List[AnswerResponse] = []
    
    # New fields for frontend results
    quizTitle: str = Field(validation_alias="quiz_title")
    correctCount: int = Field(validation_alias="correct_count")
    totalQuestions: int = Field(validation_alias="total_questions")
    percentageScore: int = Field(validation_alias="percentage_score")

    class Config:
        from_attributes = True

class LeaderboardEntry(BaseModel):
    id: int
    name: str
    score: int
    attempts: int
    rank: int
    isCurrentUser: bool
    completed_at: Optional[datetime] = None

class QuizAnalytics(BaseModel):
    quiz_title: str
    total_attempts: int
    highest_score: int
    average_score: float

# --- AGGREGATE ANALYTICS ---
class PerformancePoint(BaseModel):
    name: str # Week/Month
    avg: float
    high: float
    low: float

class QuizAttemptStat(BaseModel):
    name: str # Quiz title
    attempts: int

class InstructorAggregateAnalytics(BaseModel):
    performanceOverTime: List[PerformancePoint]
    attemptsByQuiz: List[QuizAttemptStat]

class InstructorStats(BaseModel):
    totalQuizzes: int
    totalAttempts: int
    averageScore: float
    activeStudents: int

# --- STUDENT DASHBOARD SCHEMAS ---
class RecentScore(BaseModel):
    quizName: str
    score: int
    date: str # Format: MM/DD

class StudentStats(BaseModel):
    totalAttempted: int
    averageScore: float
    highestScore: int
    recentScores: List[RecentScore]
