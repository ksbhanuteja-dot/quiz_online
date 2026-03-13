from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# --- OPTION SCHEMAS ---
class OptionBase(BaseModel):
    option_text: str
    is_correct: bool = False

class OptionCreate(OptionBase):
    pass

class OptionResponse(OptionBase):
    id: int
    question_id: int

    class Config:
        from_attributes = True

# --- QUESTION SCHEMAS ---
class QuestionBase(BaseModel):
    question_text: str

class QuestionCreate(QuestionBase):
    options: List[OptionCreate]

class QuestionResponse(QuestionBase):
    id: int
    quiz_id: int
    options: List[OptionResponse]

    class Config:
        from_attributes = True

# --- QUIZ SCHEMAS ---
class QuizBase(BaseModel):
    title: str
    timer: int # in seconds

class QuizCreate(QuizBase):
    pass

class QuizUpdate(BaseModel):
    title: Optional[str] = None
    timer: Optional[int] = None

class QuizResponse(QuizBase):
    id: int
    instructor_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class QuizFullResponse(QuizResponse):
    questions: List[QuestionResponse]
