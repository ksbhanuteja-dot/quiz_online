from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Quiz, Question, Option, User
from app.schemas.quiz import QuizCreate, QuizResponse, QuizUpdate, QuestionCreate, QuestionResponse, QuizFullResponse
from app.api.dependencies import get_current_active_user, require_role
from app.core.response_utils import success_response, APIResponse

router = APIRouter()

# --- QUIZ CRUD ---

@router.post("/", response_model=APIResponse[QuizResponse], status_code=status.HTTP_201_CREATED)
def create_quiz(
    quiz_in: QuizCreate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(require_role("Instructor"))
):
    new_quiz = Quiz(
        title=quiz_in.title,
        timer=quiz_in.timer,
        instructor_id=current_user.id
    )
    db.add(new_quiz)
    db.commit()
    db.refresh(new_quiz)
    return success_response(new_quiz)

@router.get("/", response_model=APIResponse[List[QuizResponse]])
def get_my_quizzes(
    db: Session = Depends(get_db), 
    current_user: User = Depends(require_role("Instructor"))
):
    results = db.query(Quiz).filter(Quiz.instructor_id == current_user.id).all()
    return success_response(results)

@router.get("/{quiz_id}", response_model=APIResponse[QuizFullResponse])
def get_quiz(
    quiz_id: int, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(require_role("Instructor"))
):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id, Quiz.instructor_id == current_user.id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    return success_response(quiz)

@router.put("/{quiz_id}", response_model=APIResponse[QuizResponse])
def update_quiz(
    quiz_id: int, 
    quiz_in: QuizUpdate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(require_role("Instructor"))
):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id, Quiz.instructor_id == current_user.id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    if quiz_in.title is not None:
        quiz.title = quiz_in.title
    if quiz_in.timer is not None:
        quiz.timer = quiz_in.timer
        
    db.commit()
    db.refresh(quiz)
    return success_response(quiz)

@router.delete("/{quiz_id}", response_model=APIResponse[None], status_code=status.HTTP_200_OK)
def delete_quiz(
    quiz_id: int, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(require_role("Instructor"))
):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id, Quiz.instructor_id == current_user.id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    db.delete(quiz)
    db.commit()
    return success_response(None)

# --- QUESTION MANAGEMENT ---

@router.post("/{quiz_id}/questions", response_model=APIResponse[QuestionResponse], status_code=status.HTTP_201_CREATED)
def add_question(
    quiz_id: int, 
    question_in: QuestionCreate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(require_role("Instructor"))
):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id, Quiz.instructor_id == current_user.id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found or not authorized")
    
    new_question = Question(quiz_id=quiz_id, question_text=question_in.question_text)
    db.add(new_question)
    db.flush() # Get question ID
    
    for opt in question_in.options:
        new_opt = Option(
            question_id=new_question.id,
            option_text=opt.option_text,
            is_correct=opt.is_correct
        )
        db.add(new_opt)
    
    db.commit()
    db.refresh(new_question)
    return success_response(new_question)
