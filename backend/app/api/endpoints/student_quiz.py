from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List
from datetime import datetime, timezone
from app.database import get_db
from app.models import Quiz, Question, Option, Attempt, StudentAnswer, User
from app.schemas.quiz import QuizResponse, QuizFullResponse
from app.schemas.attempt import AttemptSubmit, AttemptResponse
from app.api.dependencies import require_role
from app.core.response_utils import success_response, error_response, APIResponse

router = APIRouter()

@router.get("/", response_model=APIResponse[List[QuizResponse]])
def list_active_quizzes(
    db: Session = Depends(get_db), 
    current_user: User = Depends(require_role("Student"))
):
    results = db.query(Quiz).all()
    return success_response(results)

@router.get("/{quiz_id}", response_model=APIResponse[QuizFullResponse])
def get_quiz_for_attempt(
    quiz_id: int, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(require_role("Student"))
):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    return success_response(quiz)

@router.post("/{quiz_id}/start", response_model=APIResponse[AttemptResponse])
def start_quiz_attempt(
    quiz_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("Student"))
):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    # Check if there's already an in-progress attempt
    existing_attempt = db.query(Attempt).filter(
        Attempt.student_id == current_user.id,
        Attempt.quiz_id == quiz_id,
        Attempt.status == "in_progress"
    ).first()
    
    if existing_attempt:
        return success_response(existing_attempt)
        
    new_attempt = Attempt(
        student_id=current_user.id,
        quiz_id=quiz_id,
        status="in_progress",
        started_at=datetime.now(timezone.utc)
    )
    db.add(new_attempt)
    db.commit()
    db.refresh(new_attempt)
    return success_response(new_attempt)

@router.post("/{quiz_id}/save", status_code=status.HTTP_200_OK)
def save_quiz_progress(
    quiz_id: int,
    submission: AttemptSubmit,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("Student"))
):
    attempt = db.query(Attempt).filter(
        Attempt.quiz_id == quiz_id,
        Attempt.student_id == current_user.id,
        Attempt.status == "in_progress"
    ).first()
    
    if not attempt:
        raise HTTPException(status_code=404, detail="Active attempt not found")
    
    # Clear previous saved answers for this attempt to replace with new ones
    db.query(StudentAnswer).filter(StudentAnswer.attempt_id == attempt.id).delete()
    
    for ans in submission.answers:
        student_ans = StudentAnswer(
            attempt_id=attempt.id,
            question_id=ans.question_id,
            selected_option_id=ans.selected_option_id
        )
        db.add(student_ans)
    
    db.commit()
    return success_response("Progress saved successfully")

@router.post("/{quiz_id}/submit", response_model=APIResponse[AttemptResponse])
def submit_quiz_attempt(
    quiz_id: int, 
    submission: AttemptSubmit, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(require_role("Student"))
):
    quiz = db.query(Quiz).options(
        joinedload(Quiz.questions).joinedload(Question.options)
    ).filter(Quiz.id == quiz_id).first()
    attempt = db.query(Attempt).filter(
        Attempt.quiz_id == quiz_id,
        Attempt.student_id == current_user.id,
        Attempt.status == "in_progress"
    ).first()
    
    if not attempt:
        raise HTTPException(status_code=404, detail="Active attempt not found")
    
    # TIMER VALIDATION
    now = datetime.now(timezone.utc)
    elapsed_time = (now - attempt.started_at.replace(tzinfo=timezone.utc)).total_seconds()
    
    # Allow a small buffer (e.g., 5 seconds) for network latency
    if elapsed_time > (quiz.timer + 5):
        attempt.status = "timed_out"
        db.commit()
        raise HTTPException(status_code=status.HTTP_408_REQUEST_TIMEOUT, detail="Quiz session expired")

    # Calculate score
    total_score = 0
    # Create a mapping of question_id -> correct_option_id
    correct_options = {}
    for question in quiz.questions:
        for option in question.options:
            if option.is_correct:
                correct_options[question.id] = option.id
                break

    print(f"DEBUG: correct_options dictionary: {correct_options}")
    
    # Clear previous saved answers for this attempt and save the final submission
    db.query(StudentAnswer).filter(StudentAnswer.attempt_id == attempt.id).delete()
    
    for ans in submission.answers:
        ans_opt_id = int(ans.selected_option_id)
        correct_opt_id = correct_options.get(ans.question_id)
        is_correct = (correct_opt_id == ans_opt_id) if correct_opt_id is not None else False
        
        print(f"DEBUG: QID {ans.question_id}, Selected Opt: {ans_opt_id} (type: {type(ans_opt_id)}), Correct Opt: {correct_opt_id} (type: {type(correct_opt_id)}), Match: {is_correct}")
        
        if is_correct:
            total_score += 1
            
        student_ans = StudentAnswer(
            attempt_id=attempt.id,
            question_id=ans.question_id,
            selected_option_id=ans.selected_option_id
        )
        db.add(student_ans)
    
    print(f"DEBUG: Calculated total_score: {total_score}")
    attempt.score = total_score
    attempt.status = "completed"
    attempt.completed_at = now
    db.commit()
    db.refresh(attempt)
    return success_response(attempt)
