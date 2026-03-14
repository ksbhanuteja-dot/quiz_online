from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from app.database import get_db
from app.models import Quiz, Attempt, User
from app.schemas.attempt import QuizAnalytics, LeaderboardEntry, InstructorAggregateAnalytics, PerformancePoint, QuizAttemptStat, InstructorStats
from app.api.dependencies import require_role
from app.core.response_utils import success_response, APIResponse

router = APIRouter()

@router.get("/stats", response_model=APIResponse[InstructorStats])
def get_instructor_stats(
    db: Session = Depends(get_db), 
    current_user: User = Depends(require_role("Instructor"))
):
    quizzes = db.query(Quiz).filter(Quiz.instructor_id == current_user.id).all()
    quiz_ids = [q.id for q in quizzes]
    
    total_quizzes = len(quizzes)
    total_attempts = db.query(func.count(Attempt.id)).filter(Attempt.quiz_id.in_(quiz_ids)).scalar() or 0
    average_score = db.query(func.avg(Attempt.score)).filter(Attempt.quiz_id.in_(quiz_ids)).scalar() or 0.0
    active_students = db.query(func.count(func.distinct(Attempt.student_id))).filter(Attempt.quiz_id.in_(quiz_ids)).scalar() or 0
    
    return success_response(InstructorStats(
        totalQuizzes=total_quizzes,
        totalAttempts=total_attempts,
        averageScore=round(float(average_score), 2),
        activeStudents=active_students
    ))

@router.get("/", response_model=APIResponse[InstructorAggregateAnalytics])
def get_aggregate_analytics(
    db: Session = Depends(get_db), 
    current_user: User = Depends(require_role("Instructor"))
):
    # This is a bit complex for a simple mock-replacement, 
    # but we'll aggregate across all instructor's quizzes
    quizzes = db.query(Quiz).filter(Quiz.instructor_id == current_user.id).all()
    quiz_ids = [q.id for q in quizzes]
    
    # Attempts per quiz
    attempts_by_quiz = []
    for quiz in quizzes:
        count = db.query(func.count(Attempt.id)).filter(Attempt.quiz_id == quiz.id).scalar() or 0
        attempts_by_quiz.append(QuizAttemptStat(name=quiz.title, attempts=count))
    
    # Performance over time (Mocking weeks for now based on actual data if exists)
    # real implementation would group by date
    performance_over_time = [
        PerformancePoint(name="Week 1", avg=70, high=95, low=40),
        PerformancePoint(name="Week 2", avg=75, high=98, low=45),
        PerformancePoint(name="Week 3", avg=72, high=96, low=50),
        PerformancePoint(name="Week 4", avg=80, high=100, low=55),
    ]
    
    return success_response(InstructorAggregateAnalytics(
        performanceOverTime=performance_over_time,
        attemptsByQuiz=attempts_by_quiz
    ))

@router.get("/{quiz_id}/analytics", response_model=APIResponse[QuizAnalytics])
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
        return success_response(QuizAnalytics(
            quiz_title=quiz.title,
            total_attempts=0,
            highest_score=0,
            average_score=0.0
        ))
    
    highest_score = db.query(func.max(Attempt.score)).filter(Attempt.quiz_id == quiz_id).scalar() or 0
    average_score = db.query(func.avg(Attempt.score)).filter(Attempt.quiz_id == quiz_id).scalar() or 0.0
    
    return success_response(QuizAnalytics(
        quiz_title=quiz.title,
        total_attempts=total_attempts,
        highest_score=highest_score,
        average_score=round(float(average_score), 2)
    ))

@router.get("/{quiz_id}/leaderboard", response_model=APIResponse[List[LeaderboardEntry]])
def get_quiz_leaderboard(
    quiz_id: int, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(require_role("Instructor"))
):
    # Verify ownership
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id, Quiz.instructor_id == current_user.id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
        
    results = db.query(User.id, User.name, Attempt.score, Attempt.completed_at)\
                .join(Attempt, User.id == Attempt.student_id)\
                .filter(Attempt.quiz_id == quiz_id)\
                .order_by(Attempt.score.desc(), Attempt.completed_at.asc())\
                .limit(10).all()
    
    data = []
    for rank, r in enumerate(results, 1):
        data.append(LeaderboardEntry(
            id=r[0],
            name=r[1],
            score=int(r[2]),
            attempts=1, # Per-quiz leaderboard usually implies performance in that quiz
            rank=rank,
            isCurrentUser=False, # Instructors looking at students
            completed_at=r[3]
        ))
    return success_response(data)

@router.get("/leaderboard", response_model=APIResponse[List[LeaderboardEntry]])
def get_global_leaderboard(
    db: Session = Depends(get_db), 
    current_user: User = Depends(require_role("Instructor"))
):
    # Mirror student global leaderboard but for instructors
    results = db.query(
        User.id, 
        User.name, 
        func.sum(Attempt.score).label("total_score"),
        func.count(Attempt.id).label("attempts_count")
    ).join(Attempt, User.id == Attempt.student_id)\
     .group_by(User.id)\
     .order_by(func.sum(Attempt.score).desc())\
     .limit(50).all()
    
    data = []
    for rank, r in enumerate(results, 1):
        data.append(LeaderboardEntry(
            id=r[0],
            name=r[1],
            score=int(r[2] or 0),
            attempts=r[3],
            rank=rank,
            isCurrentUser=False,
            completed_at=None
        ))
    
    return success_response(data)
