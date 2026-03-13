from pydantic import BaseModel
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
    student_id: int
    quiz_id: int
    score: int
    completed_at: datetime
    answers: List[AnswerResponse] = []

    class Config:
        from_attributes = True

class LeaderboardEntry(BaseModel):
    student_name: str
    score: int
    completed_at: datetime

class QuizAnalytics(BaseModel):
    quiz_title: str
    total_attempts: int
    highest_score: int
    average_score: float
