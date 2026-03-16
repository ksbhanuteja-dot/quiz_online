from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.api.dependencies import get_current_active_user
from app.models.user import User
from app.models.quiz import Quiz
from app.models.attempt import Attempt
from app.models.answer import StudentAnswer
from app.models.option import Option
from app.schemas.quiz import QuizResponseSchema, QuizSimple
from app.schemas.attempt import AttemptCreate, AttemptResponse, AttemptDetail
from app.schemas.stats import StudentStats, LeaderboardEntry
from sqlalchemy import func

router = APIRouter()

@router.get("/available-quizzes", response_model=List[QuizSimple])
def get_available_quizzes(db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    # For now, all quizzes are available
    quizzes = db.query(Quiz).all()
    result = []
    for quiz in quizzes:
        q_simple = QuizSimple(
            id=quiz.id,
            title=quiz.title,
            timer=quiz.timer,
            questions_count=len(quiz.questions),
            instructor_name=quiz.instructor.name
        )
        result.append(q_simple)
    return result

@router.get("/quizzes/{id}", response_model=QuizResponseSchema)
def get_quiz_for_student(id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    quiz = db.query(Quiz).filter(Quiz.id == id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    return quiz

@router.post("/quizzes/{id}/submit", response_model=AttemptResponse)
def submit_quiz(id: int, attempt_in: AttemptCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    quiz = db.query(Quiz).filter(Quiz.id == id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    # Calculate score
    correct_count = 0
    total_questions = len(quiz.questions)
    
    db_attempt = Attempt(student_id=current_user.id, quiz_id=quiz.id)
    db.add(db_attempt)
    db.commit()
    db.refresh(db_attempt)

    for question in quiz.questions:
        # Accept both string and integer keys for question IDs (from frontend send)
        selected_option_index = attempt_in.answers.get(str(question.id))
        if selected_option_index is None:
            selected_option_index = attempt_in.answers.get(question.id)

        if selected_option_index is not None:
            try:
                selected_option_index = int(selected_option_index)
            except (TypeError, ValueError):
                continue

            # Our frontend sends index (0-3), but backend stores is_correct on Option model.
            # We need to find the option at that index for that question.
            options = db.query(Option).filter(Option.question_id == question.id).all()
            if 0 <= selected_option_index < len(options):
                selected_option = options[selected_option_index]
                db_answer = StudentAnswer(
                    attempt_id=db_attempt.id,
                    question_id=question.id,
                    selected_option_id=selected_option.id,
                )
                db.add(db_answer)
                if selected_option.is_correct:
                    correct_count += 1

    score = round((correct_count / total_questions) * 100) if total_questions > 0 else 0
    db_attempt.score = score
    db.commit()
    db.refresh(db_attempt)

    return {
        "attemptId": db_attempt.id,
        "score": score,
        "correctCount": correct_count,
        "totalQuestions": total_questions,
        "quizTitle": quiz.title
    }


@router.get("/attempts/{attempt_id}", response_model=AttemptDetail)
def get_attempt_details(attempt_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    attempt = db.query(Attempt).filter(Attempt.id == attempt_id, Attempt.student_id == current_user.id).first()
    if not attempt:
        raise HTTPException(status_code=404, detail="Attempt not found")

    questions = []
    for answer in attempt.answers:
        question = answer.question
        correct_option = next((opt for opt in question.options if opt.is_correct), None)
        options = []
        for opt in question.options:
            options.append({
                "id": opt.id,
                "optionText": opt.option_text,
                "isCorrect": opt.is_correct,
                "isSelected": opt.id == answer.selected_option_id,
            })

        questions.append({
            "questionId": question.id,
            "questionText": question.question_text,
            "options": options,
            "selectedOptionId": answer.selected_option_id,
            "correctOptionId": correct_option.id if correct_option else None,
            "isCorrect": answer.selected_option_id == (correct_option.id if correct_option else None),
        })

    return {
        "attemptId": attempt.id,
        "quizTitle": attempt.quiz.title,
        "score": attempt.score,
        "correctCount": sum(1 for q in questions if q["isCorrect"]),
        "totalQuestions": len(questions),
        "completedAt": attempt.completed_at,
        "questions": questions,
    }

@router.get("/stats", response_model=StudentStats)
def get_student_stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    attempts = db.query(Attempt).filter(Attempt.student_id == current_user.id).all()
    
    total_attempted = len(attempts)
    avg_score = sum(a.score for a in attempts) / total_attempted if total_attempted > 0 else 0
    highest_score = max((a.score for a in attempts), default=0)
    
    recent_scores = []
    for a in attempts[-5:]:
        recent_scores.append({
            "quizName": a.quiz.title,
            "score": a.score,
            "date": a.completed_at.strftime("%m/%d")
        })
        
    return {
        "totalAttempted": total_attempted,
        "averageScore": round(avg_score, 2),
        "highestScore": highest_score,
        "recentScores": recent_scores
    }

@router.get("/leaderboard", response_model=List[LeaderboardEntry])
def get_student_leaderboard(db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    # Same as instructor for now
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
