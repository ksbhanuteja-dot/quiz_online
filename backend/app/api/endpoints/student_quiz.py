from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Quiz, Question, Option, Attempt, StudentAnswer, User
from app.schemas.quiz import QuizResponse, QuizFullResponse
from app.schemas.attempt import AttemptSubmit, AttemptResponse
from app.api.dependencies import get_current_active_user, require_role

router = APIRouter()

@router.get("/", response_model=List[QuizResponse])
def list_active_quizzes(
    db: Session = Depends(get_db), 
    current_user: User = Depends(require_role("Student"))
):
    return db.query(Quiz).all()

@router.get("/{quiz_id}", response_model=QuizFullResponse)
def get_quiz_for_attempt(
    quiz_id: int, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(require_role("Student"))
):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    return quiz

@router.post("/{quiz_id}/attempt", response_model=AttemptResponse)
def submit_quiz_attempt(
    quiz_id: int, 
    submission: AttemptSubmit, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(require_role("Student"))
):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    # Calculate score
    total_score = 0
    correct_options = {opt.question_id: opt.id for q in quiz.questions for opt in q.options if opt.is_correct}
    
    attempt = Attempt(student_id=current_user.id, quiz_id=quiz_id, score=0)
    db.add(attempt)
    db.flush()
    
    for ans in submission.answers:
        is_correct = correct_options.get(ans.question_id) == ans.selected_option_id
        if is_correct:
            total_score += 1
            
        student_ans = StudentAnswer(
            attempt_id=attempt.id,
            question_id=ans.question_id,
            selected_option_id=ans.selected_option_id
        )
        db.add(student_ans)
    
    attempt.score = total_score
    db.commit()
    db.refresh(attempt)
    return attempt
