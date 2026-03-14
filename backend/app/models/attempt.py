from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class Attempt(Base):
    __tablename__ = "attempts"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    quiz_id = Column(Integer, ForeignKey("quizzes.id"), nullable=False)
    score = Column(Integer, default=0)
    status = Column(String, default="in_progress") # "in_progress", "completed", "timed_out"
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)

    student = relationship("User", backref="attempts")
    quiz = relationship("Quiz", back_populates="attempts")
    answers = relationship("StudentAnswer", back_populates="attempt")

    @property
    def quiz_title(self):
        return self.quiz.title if self.quiz else "Unknown Quiz"

    @property
    def correct_count(self):
        return self.score

    @property
    def total_questions(self):
        return len(self.quiz.questions) if self.quiz else 0

    @property
    def percentage_score(self):
        total = self.total_questions
        if total == 0: return 0
        return round((self.score / total) * 100)

