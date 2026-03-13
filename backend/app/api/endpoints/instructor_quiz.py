from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Quiz, Question, Option, User
from app.schemas.quiz import QuizCreate, QuizResponse, QuizUpdate, QuestionCreate, QuestionResponse, QuizFullResponse
from app.api.dependencies import get_current_active_user, require_role

router = APIRouter()

# --- QUIZ CRUD ---

@router.post("/", response_model=QuizResponse, status_code=status.HTTP_201_CREATED)
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
    return new_quiz

@router.get("/", response_model=List[QuizResponse])
def get_my_quizzes(
    db: Session = Depends(get_db), 
    current_user: User = Depends(require_role("Instructor"))
):
    return db.query(Quiz).filter(Quiz.instructor_id == current_user.id).all()

@router.get("/{quiz_id}", response_model=QuizFullResponse)
def get_quiz(
    quiz_id: int, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(require_role("Instructor"))
):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id, Quiz.instructor_id == current_user.id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    return quiz

@router.put("/{quiz_id}", response_model=QuizResponse)
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
    return quiz

@router.delete("/{quiz_id}", status_code=status.HTTP_204_NO_CONTENT)
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
    return None

# --- QUESTION MANAGEMENT ---

@router.post("/{quiz_id}/questions", response_model=QuestionResponse, status_code=status.HTTP_201_CREATED)
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
    return new_question
