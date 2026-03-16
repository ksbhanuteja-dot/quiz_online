from pydantic import BaseModel
from typing import List, Dict, Optional
from datetime import datetime

class StudentAnswerBase(BaseModel):
    question_id: int
    selected_option_id: int

class StudentAnswerCreate(StudentAnswerBase):
    pass

class StudentAnswer(StudentAnswerBase):
    id: int
    attempt_id: int

    class Config:
        from_attributes = True

class AttemptBase(BaseModel):
    quiz_id: int

class AttemptCreate(AttemptBase):
    answers: Dict[int, int] # question_id -> option_index or similar, will adjust if needed

class Attempt(AttemptBase):
    id: int
    student_id: int
    score: int
    completed_at: datetime

    class Config:
        from_attributes = True

class AttemptResponse(BaseModel):
    attemptId: int
    score: int
    correctCount: int
    totalQuestions: int
    quizTitle: str


class OptionResult(BaseModel):
    id: int
    optionText: str
    isCorrect: bool
    isSelected: bool


class QuestionResult(BaseModel):
    questionId: int
    questionText: str
    options: list[OptionResult]
    selectedOptionId: int | None
    correctOptionId: int | None
    isCorrect: bool


class AttemptDetail(BaseModel):
    attemptId: int
    quizTitle: str
    score: int
    correctCount: int
    totalQuestions: int
    completedAt: datetime
    questions: list[QuestionResult]

    class Config:
        from_attributes = True
