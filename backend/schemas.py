from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    is_admin: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class QuestionCreate(BaseModel):
    message: str

class QuestionAnswer(BaseModel):
    answer: str

class QuestionStatusUpdate(BaseModel):
    status: str

class QuestionResponse(BaseModel):
    id: int
    message: str
    status: str
    answer: Optional[str]
    user_id: Optional[int]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class WebSocketMessage(BaseModel):
    type: str
    data: dict
