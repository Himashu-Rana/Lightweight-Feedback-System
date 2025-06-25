from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from .. import models, schemas, auth
from ..database import get_db
from ..utils import notifications

router = APIRouter()

@router.post("/feedback-requests/", response_model=schemas.FeedbackRequest)
def create_feedback_request(
    request: schemas.FeedbackRequestCreate,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):    # Create a new feedback request
    db_request = models.FeedbackRequest(
        employee_id=current_user.id
    )
    
    db.add(db_request)
    db.commit()
    db.refresh(db_request)
    
    # If the employee has a manager, send a notification to the manager
    employee = db.query(models.User).filter(models.User.id == current_user.id).first()
    if employee and employee.manager_id:
        notifications.notify_feedback_request(db, db_request)
    
    return db_request

@router.get("/feedback-requests/", response_model=List[schemas.FeedbackRequest])
def read_feedback_requests(
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    if current_user.role == models.UserRole.EMPLOYEE:
        # Employee sees their own requests
        requests = db.query(models.FeedbackRequest).filter(
            models.FeedbackRequest.employee_id == current_user.id
        ).offset(skip).limit(limit).all()
    else:
        # Manager sees requests from their employees
        requests = db.query(models.FeedbackRequest).join(
            models.User, models.FeedbackRequest.employee_id == models.User.id
        ).filter(
            models.User.manager_id == current_user.id
        ).offset(skip).limit(limit).all()
    
    return requests

@router.get("/feedback-requests/{request_id}", response_model=schemas.FeedbackRequest)
def read_feedback_request(
    request_id: int,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    request = db.query(models.FeedbackRequest).filter(
        models.FeedbackRequest.id == request_id
    ).first()
    
    if not request:
        raise HTTPException(status_code=404, detail="Feedback request not found")
    
    # Check if user is authorized to view this request
    if current_user.role == models.UserRole.EMPLOYEE:
        if request.employee_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access this feedback request"
            )
    else:  # Manager
        employee = db.query(models.User).filter(
            models.User.id == request.employee_id,
            models.User.manager_id == current_user.id
        ).first()
        if not employee:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access this feedback request"
            )
    
    return request
