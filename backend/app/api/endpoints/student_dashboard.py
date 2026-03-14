from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from app.database import get_db
from app.models import Attempt, Quiz, User
from app.schemas.attempt import AttemptResponse, LeaderboardEntry, StudentStats, RecentScore
from app.api.dependencies import require_role
from app.core.response_utils import success_response, APIResponse

router = APIRouter()

@router.get("/stats", response_model=APIResponse[StudentStats])
def get_student_stats(
    db: Session = Depends(get_db), 
    current_user: User = Depends(require_role("Student"))
):
    attempts = db.query(Attempt).join(Quiz).filter(Attempt.student_id == current_user.id).order_by(Attempt.completed_at.asc()).all()
    
    total_attempted = len(attempts)
    if total_attempted == 0:
        return success_response(StudentStats(
            totalAttempted=0,
            averageScore=0.0,
            highestScore=0,
            recentScores=[]
        ))
    
    scores = [a.score for a in attempts if a.score is not None]
    average_score = sum(scores) / len(scores) if scores else 0.0
    highest_score = max(scores) if scores else 0
    
    recent_scores = []
    for a in attempts[-10:]: # Last 10 attempts
        if a.completed_at:
            recent_scores.append(RecentScore(
                quizName=a.quiz.title,
                score=a.score,
                date=a.completed_at.strftime("%m/%d")
            ))
            
    return success_response(StudentStats(
        totalAttempted=total_attempted,
        averageScore=round(float(average_score), 2),
        highestScore=highest_score,
        recentScores=recent_scores
    ))

@router.get("/my-attempts", response_model=APIResponse[List[AttemptResponse]])
def get_my_history(
    db: Session = Depends(get_db), 
    current_user: User = Depends(require_role("Student"))
):
    results = db.query(Attempt).filter(Attempt.student_id == current_user.id).order_by(Attempt.completed_at.desc()).all()
    return success_response(results)

@router.get("/leaderboard", response_model=APIResponse[List[LeaderboardEntry]])
def get_global_leaderboard(
    db: Session = Depends(get_db), 
    current_user: User = Depends(require_role("Student"))
):
    # Get total score and attempt count for students
    results = db.query(
        User.id, 
        User.name, 
        func.sum(Attempt.score).label("total_score"),
        func.count(Attempt.id).label("attempts_count"),
        func.max(Attempt.completed_at).label("last_completed")
    ).join(Attempt, User.id == Attempt.student_id)\
     .group_by(User.id)\
     .order_by(func.sum(Attempt.score).desc())\
     .limit(50).all()
    
    data = []
    for rank, r in enumerate(results, 1):
        data.append(LeaderboardEntry(
            id=r[0],
            name=r[1],
            score=int(r[2]),
            attempts=r[3],
            rank=rank,
            isCurrentUser=(r[0] == current_user.id),
            completed_at=r[4]
        ))
    
    return success_response(data)
