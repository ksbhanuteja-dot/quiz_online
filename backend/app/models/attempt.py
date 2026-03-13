from sqlalchemy import Column, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class Attempt(Base):
    __tablename__ = "attempts"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    quiz_id = Column(Integer, ForeignKey("quizzes.id"), nullable=False)
    score = Column(Integer, default=0)
    completed_at = Column(DateTime(timezone=True), server_default=func.now())

    student = relationship("User", backref="attempts")
    quiz = relationship("Quiz", back_populates="attempts")
    answers = relationship("StudentAnswer", back_populates="attempt")
