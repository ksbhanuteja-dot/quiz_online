from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class Quiz(Base):
    __tablename__ = "quizzes"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    instructor_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    timer = Column(Integer, nullable=False) # timer in seconds
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    instructor = relationship("User", backref="quizzes")
    questions = relationship("Question", back_populates="quiz", cascade="all, delete-orphan")
    attempts = relationship("Attempt", back_populates="quiz")
