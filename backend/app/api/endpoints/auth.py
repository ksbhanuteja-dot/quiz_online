from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin, UserWithToken, SignupResponse
from app.core.security import get_password_hash, verify_password, create_access_token
from app.api.dependencies import get_current_active_user

router = APIRouter()


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
        is_active=True,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "Account created. You can now log in.",
        "user": new_user,
    }


@router.post("/login", response_model=UserWithToken)
def login(user_in: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_in.email).first()
    if not user or not verify_password(user_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
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
