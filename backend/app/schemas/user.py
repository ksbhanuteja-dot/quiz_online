from pydantic import BaseModel, EmailStr, model_validator
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    name: str
    password: str
    confirm_password: str
    role: str  # "Instructor" or "Student"

    @model_validator(mode='after')
    def passwords_match(self):
        if self.password != self.confirm_password:
            raise ValueError('Passwords do not match')
        return self

class UserLogin(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    name: str
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None

class UserWithToken(BaseModel):
    token: str
    user: UserResponse

class SignupResponse(BaseModel):
    message: str
    user: UserResponse
