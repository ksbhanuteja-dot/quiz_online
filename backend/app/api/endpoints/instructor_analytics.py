from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from app.database import get_db
from app.models import Quiz, Attempt, User
from app.schemas.attempt import QuizAnalytics, LeaderboardEntry
from app.api.dependencies import require_role

router = APIRouter()

@router.get("/{quiz_id}/analytics", response_model=QuizAnalytics)
def get_quiz_analytics(
    quiz_id: int, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(require_role("Instructor"))
):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id, Quiz.instructor_id == current_user.id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    attempts = db.query(Attempt).filter(Attempt.quiz_id == quiz_id).all()
    total_attempts = len(attempts)
    
    if total_attempts == 0:
        return QuizAnalytics(
            quiz_title=quiz.title,
            total_attempts=0,
            highest_score=0,
            average_score=0.0
        )
    
    highest_score = db.query(func.max(Attempt.score)).filter(Attempt.quiz_id == quiz_id).scalar() or 0
    average_score = db.query(func.avg(Attempt.score)).filter(Attempt.quiz_id == quiz_id).scalar() or 0.0
    
    return QuizAnalytics(
        quiz_title=quiz.title,
        total_attempts=total_attempts,
        highest_score=highest_score,
        average_score=round(float(average_score), 2)
    )

@router.get("/{quiz_id}/leaderboard", response_model=List[LeaderboardEntry])
def get_quiz_leaderboard(
    quiz_id: int, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(require_role("Instructor"))
):
    # Verify ownership
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id, Quiz.instructor_id == current_user.id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
        
    results = db.query(User.name, Attempt.score, Attempt.completed_at)\
                .join(Attempt, User.id == Attempt.student_id)\
                .filter(Attempt.quiz_id == quiz_id)\
                .order_by(Attempt.score.desc(), Attempt.completed_at.asc())\
                .limit(10).all()
    
    return [LeaderboardEntry(student_name=r[0], score=r[1], completed_at=r[2]) for r in results]
