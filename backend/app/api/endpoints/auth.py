from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from pydantic import BaseModel, EmailStr

from app.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin, UserWithToken, SignupResponse
from app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    create_email_verification_token,
)
from app.core.email import send_email
from app.core.config import settings
from app.api.dependencies import get_current_active_user

router = APIRouter()

class EmailRequest(BaseModel):
    email: EmailStr


@router.post("/signup", response_model=SignupResponse, status_code=status.HTTP_201_CREATED)
def signup(user_in: UserCreate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists."
        )

    if user_in.role not in ["Instructor", "Student"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid role. Must be 'Instructor' or 'Student'."
        )

    hashed_password = get_password_hash(user_in.password)
    new_user = User(
        name=user_in.name,
        email=user_in.email,
        hashed_password=hashed_password,
        role=user_in.role,
        is_active=False,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Send verification email
    verification_token = create_email_verification_token(
        email=new_user.email,
        role=new_user.role,
        expires_delta=timedelta(hours=24),
    )
    verify_link = f"{settings.FRONTEND_URL}/verify-email?token={verification_token}"
    email_body = (
        f"Hi {new_user.name},\n\n"
        f"Welcome to QuizOnline! Please verify your email address by clicking the link below:\n\n"
        f"{verify_link}\n\n"
        "If you did not create an account, you can ignore this message.\n"
    )
    send_email("Verify your QuizOnline account", new_user.email, email_body)

    response = {
        "message": "Account created. A verification email has been sent. Please verify your email before logging in.",
        "user": new_user,
    }

    # Helpful for testing / development: include token in response when DEBUG is enabled.
    if settings.DEBUG:
        response["verificationToken"] = verification_token

    return response


@router.get("/verify-email")
def verify_email(token: str, db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        token_type = payload.get("type")
        if token_type != "email_verification":
            raise JWTError("Invalid token type")
        email = payload.get("sub")
        if email is None:
            raise JWTError("Missing email")
    except JWTError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired verification token")

    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if user.is_active:
        return {"message": "Email is already verified."}

    user.is_active = True
    db.commit()
    return {"message": "Email verified successfully. You may now log in."}


@router.post("/resend-verification")
def resend_verification(request: EmailRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if user.is_active:
        return {"message": "Your email is already verified. Please log in."}

    verification_token = create_email_verification_token(
        email=user.email,
        role=user.role,
        expires_delta=timedelta(hours=24),
    )
    verify_link = f"{settings.FRONTEND_URL}/verify-email?token={verification_token}"
    email_body = (
        f"Hi {user.name},\n\n"
        f"Please verify your QuizOnline account by clicking the link below:\n\n"
        f"{verify_link}\n\n"
        "If you did not create an account, you can ignore this message.\n"
    )
    send_email("Verify your QuizOnline account", user.email, email_body)
    return {"message": "Verification email sent. Please check your inbox."}


@router.post("/login", response_model=UserWithToken)
def login(user_in: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_in.email).first()
    if not user or not verify_password(user_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email not verified. Please check your inbox.",
        )

    access_token = create_access_token(subject=user.email, role=user.role)
    return {"token": access_token, "user": user}


@router.post("/logout")
def logout(current_user: User = Depends(get_current_active_user)):
    """
    In JWT-based auth, logout is typically handled by the client by deleting the token.
    However, we can provide this endpoint for future-proofing (e.g., token blacklisting).
    """
    return {"message": "Successfully logged out"}
