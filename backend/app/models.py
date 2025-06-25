from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, DateTime, Text, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from .database import Base

class UserRole(str, enum.Enum):
    MANAGER = "manager"
    EMPLOYEE = "employee"

class FeedbackSentiment(str, enum.Enum):
    POSITIVE = "positive"
    NEUTRAL = "neutral"
    NEGATIVE = "negative"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    full_name = Column(String)
    hashed_password = Column(String)
    role = Column(Enum(UserRole))
    is_active = Column(Boolean, default=True)

    # Manager can have many employees
    manager_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Relationships
    employees = relationship("User", backref="manager", remote_side=[id])
    feedbacks_given = relationship("Feedback", foreign_keys="Feedback.manager_id", back_populates="manager")
    feedbacks_received = relationship("Feedback", foreign_keys="Feedback.employee_id", back_populates="employee")
    feedback_requests = relationship("FeedbackRequest", back_populates="employee")

class Feedback(Base):
    __tablename__ = "feedback"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text)
    strengths = Column(Text)
    areas_to_improve = Column(Text)
    sentiment = Column(Enum(FeedbackSentiment))
    is_anonymous = Column(Boolean, default=False)
    
    # Relationships
    manager_id = Column(Integer, ForeignKey("users.id"))
    employee_id = Column(Integer, ForeignKey("users.id"))
    manager = relationship("User", foreign_keys=[manager_id], back_populates="feedbacks_given")
    employee = relationship("User", foreign_keys=[employee_id], back_populates="feedbacks_received")
    
    is_acknowledged = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Optional: link to a feedback request
    feedback_request_id = Column(Integer, ForeignKey("feedback_requests.id"), nullable=True)
    feedback_request = relationship("FeedbackRequest", back_populates="feedback")
    
    # Optional: Employee's comments on the feedback
    comments = relationship("FeedbackComment", back_populates="feedback", cascade="all, delete-orphan")
    
    # Tags for the feedback
    tags = relationship("FeedbackTag", back_populates="feedback", cascade="all, delete-orphan")
    
    # Tags for this feedback
    tags = relationship("FeedbackTag", back_populates="feedback", cascade="all, delete-orphan")

class FeedbackRequest(Base):
    __tablename__ = "feedback_requests"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("users.id"))
    status = Column(String, default="pending")  # pending, completed
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    employee = relationship("User", back_populates="feedback_requests")
    feedback = relationship("Feedback", back_populates="feedback_request", uselist=False)

class FeedbackComment(Base):
    __tablename__ = "feedback_comments"

    id = Column(Integer, primary_key=True, index=True)
    feedback_id = Column(Integer, ForeignKey("feedback.id"))
    comment = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationship
    feedback = relationship("Feedback", back_populates="comments")

class FeedbackTag(Base):
    __tablename__ = "feedback_tags"

    id = Column(Integer, primary_key=True, index=True)
    feedback_id = Column(Integer, ForeignKey("feedback.id"))
    tag_name = Column(String)
    
    # Relationship
    feedback = relationship("Feedback", back_populates="tags")
    
class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    message = Column(String)
    read = Column(Boolean, default=False)
    related_feedback_id = Column(Integer, ForeignKey("feedback.id"), nullable=True)
    related_request_id = Column(Integer, ForeignKey("feedback_requests.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", backref="notifications")
