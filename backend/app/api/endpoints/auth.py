from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse, Token, UserWithToken, UserLogin
from app.core.security import get_password_hash, verify_password, create_access_token
from app.api.dependencies import get_current_active_user

router = APIRouter()

@router.post("/signup", response_model=UserWithToken, status_code=status.HTTP_201_CREATED)
def signup(user_in: UserCreate, db: Session = Depends(get_db)):
    print(f"DEBUG: signup received: {user_in}")
    try:
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
            role=user_in.role
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        access_token = create_access_token(subject=new_user.email, role=new_user.role)
        return {"token": access_token, "user": new_user}
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise e

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
