from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Dict, List
import json

from .. import models, schemas, auth
from ..database import get_db

router = APIRouter()

@router.get("/dashboard/manager", response_model=schemas.ManagerDashboard)
def get_manager_dashboard(
    current_user: models.User = Depends(auth.get_current_manager),
    db: Session = Depends(get_db)
):
    try:
        print(f"Manager {current_user.id} requesting dashboard")
        
        # Get count of employees - with error handling
        try:
            employees_count = db.query(models.User).filter(
                models.User.manager_id == current_user.id
            ).count()
            print(f"Found {employees_count} employees")
        except Exception as e:
            print(f"Error counting employees: {str(e)}")
            employees_count = 0
        
        # Get count of feedback given - with error handling
        try:
            feedback_count = db.query(models.Feedback).filter(
                models.Feedback.manager_id == current_user.id
            ).count()
            print(f"Found {feedback_count} feedback items")
        except Exception as e:
            print(f"Error counting feedback: {str(e)}")
            feedback_count = 0
        
        # Initialize sentiment dict with defaults
        feedback_by_sentiment = {
            "positive": 0,
            "neutral": 0,
            "negative": 0
        }
        
        # Get sentiment distribution - with error handling
        try:
            sentiment_counts = db.query(
                models.Feedback.sentiment,
                func.count(models.Feedback.id)
            ).filter(
                models.Feedback.manager_id == current_user.id
            ).group_by(models.Feedback.sentiment).all()
            
            print(f"Sentiment counts: {sentiment_counts}")
            
            for sentiment, count in sentiment_counts:
                if sentiment and sentiment.value in feedback_by_sentiment:
                    feedback_by_sentiment[sentiment.value] = count
                
        except Exception as e:
            print(f"Error getting sentiment counts: {str(e)}")
        
        # Get recent feedback - with error handling
        try:
            recent_feedback = db.query(models.Feedback).filter(
                models.Feedback.manager_id == current_user.id
            ).order_by(
                models.Feedback.created_at.desc()
            ).limit(5).all()
            print(f"Found {len(recent_feedback)} recent feedback items")
        except Exception as e:
            print(f"Error getting recent feedback: {str(e)}")
            recent_feedback = []
        
        return {
            "feedback_count": feedback_count,
            "employees_count": employees_count,
            "feedback_by_sentiment": feedback_by_sentiment,
            "recent_feedback": recent_feedback
        }
    except Exception as e:
        print(f"ERROR in get_manager_dashboard: {str(e)}")
        import traceback
        traceback.print_exc()
        # Return default empty dashboard rather than error
        return {
            "feedback_count": 0,
            "employees_count": 0,
            "feedback_by_sentiment": {"positive": 0, "neutral": 0, "negative": 0},
            "recent_feedback": []
        }
    
    return {
        "feedback_count": feedback_count,
        "employees_count": employees_count,
        "feedback_by_sentiment": feedback_by_sentiment,
        "recent_feedback": recent_feedback
    }

@router.get("/dashboard/employee", response_model=schemas.EmployeeDashboard)
def get_employee_dashboard(
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    try:
        print(f"User {current_user.id} requesting employee dashboard")
        
        if current_user.role != models.UserRole.EMPLOYEE:
            print("User is not an employee")
            # Return empty dashboard instead of error
            return {
                "feedback_count": 0,
                "feedback_by_sentiment": {"positive": 0, "neutral": 0, "negative": 0},
                "recent_feedback": []
            }
        
        # Get count of feedback received - with error handling
        try:
            feedback_count = db.query(models.Feedback).filter(
                models.Feedback.employee_id == current_user.id
            ).count()
            print(f"Found {feedback_count} feedback items")
        except Exception as e:
            print(f"Error counting feedback: {str(e)}")
            feedback_count = 0
        
        # Initialize sentiment dict with defaults
        feedback_by_sentiment = {
            "positive": 0,
            "neutral": 0,
            "negative": 0
        }
        
        # Get sentiment distribution - with error handling
        try:
            sentiment_counts = db.query(
                models.Feedback.sentiment,
                func.count(models.Feedback.id)
            ).filter(
                models.Feedback.employee_id == current_user.id
            ).group_by(models.Feedback.sentiment).all()
            
            print(f"Sentiment counts: {sentiment_counts}")
            
            for sentiment, count in sentiment_counts:
                if sentiment and sentiment.value in feedback_by_sentiment:
                    feedback_by_sentiment[sentiment.value] = count
                
        except Exception as e:
            print(f"Error getting sentiment counts: {str(e)}")
        
        # Get recent feedback - with error handling
        try:
            recent_feedback = db.query(models.Feedback).filter(
                models.Feedback.employee_id == current_user.id
            ).order_by(
                models.Feedback.created_at.desc()
            ).limit(5).all()
            print(f"Found {len(recent_feedback)} recent feedback items")
        except Exception as e:
            print(f"Error getting recent feedback: {str(e)}")
            recent_feedback = []
        
        return {
            "feedback_count": feedback_count,
            "feedback_by_sentiment": feedback_by_sentiment,
            "recent_feedback": recent_feedback
        }
    except Exception as e:
        print(f"ERROR in get_employee_dashboard: {str(e)}")
        import traceback
        traceback.print_exc()
        # Return default empty dashboard rather than error
        return {
            "feedback_count": 0,
            "feedback_by_sentiment": {"positive": 0, "neutral": 0, "negative": 0},
            "recent_feedback": []
        }
