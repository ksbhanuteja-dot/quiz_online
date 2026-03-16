from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class OptionBase(BaseModel):
    option_text: str
    is_correct: bool = False

class OptionCreate(OptionBase):
    pass

class Option(OptionBase):
    id: int
    question_id: int

    class Config:
        from_attributes = True

class QuestionBase(BaseModel):
    question_text: str

class QuestionCreate(QuestionBase):
    options: List[OptionCreate]

class Question(QuestionBase):
    id: int
    quiz_id: int
    options: List[Option]

    class Config:
        from_attributes = True

class QuizBase(BaseModel):
    title: str
    timer: int

class QuizCreate(QuizBase):
    questions: List[QuestionCreate]

class QuizResponseSchema(QuizBase):
    id: int
    instructor_id: int
    created_at: datetime
    questions: List[Question]

    class Config:
        from_attributes = True

class QuizSimple(QuizBase):
    id: int
    instructor_name: Optional[str] = None
    questions_count: Optional[int] = 0

    class Config:
        from_attributes = True


class ImportQuizResponse(BaseModel):
    message: str
    quiz: QuizResponseSchema
