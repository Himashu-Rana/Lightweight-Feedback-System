from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

# Enums
class UserRole(str, Enum):
    MANAGER = "manager"
    EMPLOYEE = "employee"

class FeedbackSentiment(str, Enum):
    POSITIVE = "positive"
    NEUTRAL = "neutral"
    NEGATIVE = "negative"

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: UserRole

class UserCreate(UserBase):
    password: str
    manager_id: Optional[int] = None

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    password: Optional[str] = None

class User(UserBase):
    id: int
    is_active: bool
    manager_id: Optional[int] = None

    class Config:
        from_attributes = True

# Feedback Schemas
class FeedbackBase(BaseModel):
    content: str
    strengths: str
    areas_to_improve: str
    sentiment: FeedbackSentiment
    is_anonymous: Optional[bool] = False
    tags: Optional[List[str]] = []

class FeedbackCreate(FeedbackBase):
    employee_id: int
    feedback_request_id: Optional[int] = None

class FeedbackUpdate(BaseModel):
    content: Optional[str] = None
    strengths: Optional[str] = None
    areas_to_improve: Optional[str] = None
    sentiment: Optional[FeedbackSentiment] = None

class Feedback(FeedbackBase):
    id: int
    manager_id: int
    employee_id: int
    is_acknowledged: bool
    created_at: datetime
    updated_at: datetime
    feedback_request_id: Optional[int] = None

    class Config:
        from_attributes = True

# FeedbackRequest Schemas
class FeedbackRequestCreate(BaseModel):
    pass  # No additional fields needed

class FeedbackRequest(BaseModel):
    id: int
    employee_id: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

# FeedbackComment Schemas
class FeedbackCommentCreate(BaseModel):
    comment: str

class FeedbackComment(BaseModel):
    id: int
    feedback_id: int
    comment: str
    created_at: datetime

    class Config:
        from_attributes = True

# Token Schema
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None

# Dashboard Schemas
class ManagerDashboard(BaseModel):
    feedback_count: int
    employees_count: int
    feedback_by_sentiment: dict
    recent_feedback: List[Feedback]

class EmployeeDashboard(BaseModel):
    feedback_count: int
    feedback_by_sentiment: dict
    recent_feedback: List[Feedback]
    
# Notification Schemas
class Notification(BaseModel):
    id: int
    user_id: int
    message: str
    read: bool
    related_feedback_id: Optional[int] = None
    related_request_id: Optional[int] = None
    created_at: datetime
    
    class Config:
        from_attributes = True
