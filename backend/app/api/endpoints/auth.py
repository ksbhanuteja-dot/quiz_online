from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse, SignupResponse, Token
from app.core.security import get_password_hash, verify_password, create_access_token
from app.api.dependencies import get_current_active_user
from app.core.response_utils import success_response, APIResponse

router = APIRouter()

# ─── Request Body Schemas ────────────────────────────────────────────────

class LoginRequest(BaseModel):
    email: str
    password: str

# ─── Endpoints ───────────────────────────────────────────────────────────

@router.post("/signup", response_model=APIResponse[SignupResponse], status_code=status.HTTP_201_CREATED)
def signup(user_in: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists."
        )

    # Normalize role to capitalized form that the system uses ("Instructor" / "Student")
    normalized_role = user_in.role.capitalize()
    if normalized_role not in ["Instructor", "Student"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid role. Must be 'Instructor' or 'Student'."
        )

    hashed_password = get_password_hash(user_in.password)
    new_user = User(
        name=user_in.name,
        email=user_in.email,
        hashed_password=hashed_password,
        role=normalized_role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Auto-login: return token along with user info so frontend can log in immediately
    access_token = create_access_token(subject=new_user.email, role=new_user.role)
    return success_response({
        "id": new_user.id,
        "name": new_user.name,
        "email": new_user.email,
        "role": new_user.role,
        "access_token": access_token,
        "token_type": "bearer"
    })


@router.post("/login", response_model=APIResponse[Token])
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    """Login with JSON body { email, password } — returns JWT token."""
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(subject=user.email, role=user.role)
    return success_response({"access_token": access_token, "token_type": "bearer"})


@router.get("/me", response_model=APIResponse[UserResponse])
def get_current_user_profile(current_user: User = Depends(get_current_active_user)):
    """Get the currently authenticated user's profile."""
    return success_response(current_user)


@router.post("/logout", response_model=APIResponse[dict])
def logout(current_user: User = Depends(get_current_active_user)):
    """JWT logout — client should delete the token."""
    return success_response({"message": "Successfully logged out"})
