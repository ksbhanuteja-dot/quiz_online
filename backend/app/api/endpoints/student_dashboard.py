from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from app.database import get_db
from app.models import Attempt, Quiz, User
from app.schemas.attempt import AttemptResponse, LeaderboardEntry
from app.api.dependencies import require_role

router = APIRouter()

@router.get("/my-attempts", response_model=List[AttemptResponse])
def get_my_history(
    db: Session = Depends(get_db), 
    current_user: User = Depends(require_role("Student"))
):
    return db.query(Attempt).filter(Attempt.student_id == current_user.id).order_by(Attempt.completed_at.desc()).all()

@router.get("/leaderboard", response_model=List[LeaderboardEntry])
def get_global_leaderboard(
    db: Session = Depends(get_db), 
    current_user: User = Depends(require_role("Student"))
):
    results = db.query(User.name, func.sum(Attempt.score), func.max(Attempt.completed_at))\
                .join(Attempt, User.id == Attempt.student_id)\
                .group_by(User.id)\
                .order_by(func.sum(Attempt.score).desc())\
                .limit(20).all()
    
    return [LeaderboardEntry(student_name=r[0], score=r[1], completed_at=r[2]) for r in results]
