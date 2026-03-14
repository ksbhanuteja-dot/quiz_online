from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.api.dependencies import get_current_active_user
from app.models.user import User
from app.models.quiz import Quiz
from app.models.question import Question
from app.models.option import Option
from app.models.attempt import Attempt
from app.schemas.quiz import QuizCreate, QuizResponseSchema, QuizSimple
from app.schemas.stats import InstructorStats, LeaderboardEntry
from sqlalchemy import func

router = APIRouter()

@router.get("/quizzes", response_model=List[QuizSimple])
def get_quizzes(db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    if current_user.role != "Instructor":
        raise HTTPException(status_code=403, detail="Only instructors can access this")
    
    quizzes = db.query(Quiz).filter(Quiz.instructor_id == current_user.id).all()
    result = []
    for quiz in quizzes:
        q_simple = QuizSimple(
            id=quiz.id,
            title=quiz.title,
            timer=quiz.timer,
            questions_count=len(quiz.questions)
        )
        result.append(q_simple)
    return result

@router.post("/quizzes", response_model=QuizResponseSchema)
def create_quiz(quiz_in: QuizCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    if current_user.role != "Instructor":
        raise HTTPException(status_code=403, detail="Only instructors can create quizzes")
    
    db_quiz = Quiz(title=quiz_in.title, timer=quiz_in.timer, instructor_id=current_user.id)
    db.add(db_quiz)
    db.commit()
    db.refresh(db_quiz)

    for q_in in quiz_in.questions:
        db_question = Question(quiz_id=db_quiz.id, question_text=q_in.question_text)
        db.add(db_question)
        db.commit()
        db.refresh(db_question)
        
        for o_in in q_in.options:
            db_option = Option(question_id=db_question.id, option_text=o_in.option_text, is_correct=o_in.is_correct)
            db.add(db_option)
    
    db.commit()
    db.refresh(db_quiz)
    return db_quiz

@router.get("/quizzes/{id}", response_model=QuizResponseSchema)
def get_quiz(id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    quiz = db.query(Quiz).filter(Quiz.id == id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    return quiz

@router.delete("/quizzes/{id}")
def delete_quiz(id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    quiz = db.query(Quiz).filter(Quiz.id == id, Quiz.instructor_id == current_user.id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found or unauthorized")
    db.delete(quiz)
    db.commit()
    return {"message": "Quiz deleted successfully"}

@router.get("/stats", response_model=InstructorStats)
def get_stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    if current_user.role != "Instructor":
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    total_quizzes = db.query(Quiz).filter(Quiz.instructor_id == current_user.id).count()
    quiz_ids = [q.id for q in db.query(Quiz.id).filter(Quiz.instructor_id == current_user.id).all()]
    
    total_attempts = db.query(Attempt).filter(Attempt.quiz_id.in_(quiz_ids)).count() if quiz_ids else 0
    avg_score = db.query(func.avg(Attempt.score)).filter(Attempt.quiz_id.in_(quiz_ids)).scalar() if quiz_ids else 0
    active_students = db.query(Attempt.student_id).filter(Attempt.quiz_id.in_(quiz_ids)).distinct().count() if quiz_ids else 0
    
    return {
        "totalQuizzes": total_quizzes,
        "totalAttempts": total_attempts,
        "averageScore": round(avg_score or 0, 2),
        "activeStudents": active_students
    }

@router.get("/leaderboard", response_model=List[LeaderboardEntry])
def get_leaderboard(db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    # Global leaderboard for simplicity
    results = db.query(
        User.id, 
        User.name, 
        func.sum(Attempt.score).label("total_score"),
        func.count(Attempt.id).label("total_attempts")
    ).join(Attempt, User.id == Attempt.student_id).group_by(User.id).order_by(func.sum(Attempt.score).desc()).all()
    
    leaderboard = []
    for i, res in enumerate(results):
        leaderboard.append({
            "id": res.id,
            "name": res.name,
            "score": res.total_score,
            "attempts": res.total_attempts,
            "rank": i + 1,
            "isCurrentUser": res.id == current_user.id
        })
    return leaderboard

@router.put("/quizzes/{id}", response_model=QuizResponseSchema)
def update_quiz(id: int, quiz_in: QuizCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    quiz = db.query(Quiz).filter(Quiz.id == id, Quiz.instructor_id == current_user.id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    quiz.title = quiz_in.title
    quiz.timer = quiz_in.timer
    
    # Clear old questions
    db.query(Question).filter(Question.quiz_id == id).delete()
    db.commit()
    
    for q_in in quiz_in.questions:
        db_question = Question(quiz_id=quiz.id, question_text=q_in.question_text)
        db.add(db_question)
        db.commit()
        db.refresh(db_question)
        
        for o_in in q_in.options:
            db_option = Option(question_id=db_question.id, option_text=o_in.option_text, is_correct=o_in.is_correct)
            db.add(db_option)
    
    db.commit()
    db.refresh(quiz)
    return quiz

@router.get("/analytics")
def get_analytics(db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    if current_user.role != "Instructor":
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    return {
        "performanceOverTime": [
            { "name": "Week 1", "avg": 65, "high": 90, "low": 40 },
            { "name": "Week 2", "avg": 68, "high": 92, "low": 45 },
            { "name": "Week 3", "avg": 74, "high": 95, "low": 50 },
            { "name": "Week 4", "avg": 81, "high": 98, "low": 60 }
        ],
        "attemptsByQuiz": [
            { "name": "Sample Quiz", "attempts": 5 }
        ]
    }
