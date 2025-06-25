from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from .. import models, schemas, auth
from ..database import get_db
from ..utils import notifications

router = APIRouter()

@router.post("/feedback/", response_model=schemas.Feedback)
def create_feedback(
    feedback: schemas.FeedbackCreate,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    try:
        print(f"Received feedback submission from user {current_user.id} - {current_user.email}")
        print(f"Feedback data: {feedback}")
        
        # Extract tags before creating the feedback object
        tags = feedback.tags
        feedback_dict = feedback.dict(exclude={"tags"})
    except Exception as e:
        print(f"ERROR in feedback creation: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")
    
    try:
        # Different handling based on user role
        if current_user.role == models.UserRole.MANAGER:
            print("User is a manager, proceeding with manager flow")
            # Verify employee belongs to this manager
            employee = db.query(models.User).filter(
                models.User.id == feedback.employee_id,
                models.User.manager_id == current_user.id
            ).first()
            
            print(f"Employee lookup result: {employee}")
            if not employee:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Employee with ID {feedback.employee_id} not managed by you"
                )
                
            # For managers, create normal downward feedback
            db_feedback = models.Feedback(
                **feedback_dict,
                manager_id=current_user.id
            )
            print(f"Created manager feedback object: {db_feedback.__dict__}")
            
        else:  # Employee giving feedback to manager
            print("User is an employee, proceeding with employee flow")
            # Check if target is their manager
            if feedback.employee_id != current_user.manager_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Employees can only submit feedback to their manager"
                )
                
            # For employees, swap the direction - they're giving feedback to their manager
            db_feedback = models.Feedback(
                **feedback_dict,
                manager_id=current_user.id,  # Employee is providing feedback
                employee_id=current_user.manager_id  # Manager is receiving feedback
            )
            print(f"Created employee feedback object: {db_feedback.__dict__}")
    except Exception as e:
        print(f"ERROR in role handling: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Server error in role handling: {str(e)}")
    
    # Check if this feedback is fulfilling a request
    if feedback.feedback_request_id:
        request = db.query(models.FeedbackRequest).filter(
            models.FeedbackRequest.id == feedback.feedback_request_id,
            models.FeedbackRequest.employee_id == feedback.employee_id
        ).first()
        
        if not request:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail="Feedback request not found or not for this employee"
            )
        
        request.status = "completed"
      # Add feedback to database
    try:
        # Add feedback to database
        print("Adding feedback to database")
        db.add(db_feedback)
        print("Committing transaction")
        db.commit()
        print("Refreshing feedback object")
        db.refresh(db_feedback)
        print(f"Feedback created with ID: {db_feedback.id}")
        
        # Add tags if provided
        if tags:
            print(f"Adding tags: {tags}")
            for tag_name in tags:
                tag = models.FeedbackTag(feedback_id=db_feedback.id, tag_name=tag_name)
                db.add(tag)
            db.commit()
            print("Tags added successfully")
        
        # Send notification to employee
        print("Sending notification")
        notifications.notify_new_feedback(db, db_feedback)
        print("Notification sent")
        
        print("Returning feedback object to client")
        return db_feedback
    except Exception as e:
        print(f"ERROR in database operations: {str(e)}")
        import traceback
        traceback.print_exc()
        db.rollback()  # Roll back transaction on error
        raise HTTPException(status_code=500, detail=f"Server error in database operations: {str(e)}")

@router.get("/feedback/", response_model=List[schemas.Feedback])
def read_feedback(
    skip: int = 0, 
    limit: int = 100,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    try:
        if current_user.role == models.UserRole.MANAGER:
            print(f"Manager {current_user.id} requesting feedback list")
            # Managers see feedback they've given
            feedback = db.query(models.Feedback).filter(
                models.Feedback.manager_id == current_user.id
            ).offset(skip).limit(limit).all()
        else:
            print(f"Employee {current_user.id} requesting feedback list")
            # Employees see feedback they've received
            feedback = db.query(models.Feedback).filter(
                models.Feedback.employee_id == current_user.id
            ).offset(skip).limit(limit).all()
        
        print(f"Found {len(feedback)} feedback items")
        return feedback
    except Exception as e:
        print(f"ERROR in read_feedback: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")

@router.get("/feedback/{feedback_id}", response_model=schemas.Feedback)
def read_feedback_by_id(
    feedback_id: int,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    feedback = db.query(models.Feedback).filter(models.Feedback.id == feedback_id).first()
    
    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")
    
    # Check if user is authorized to view this feedback
    if (current_user.role == models.UserRole.EMPLOYEE and feedback.employee_id != current_user.id) or \
       (current_user.role == models.UserRole.MANAGER and feedback.manager_id != current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this feedback"
        )
    
    return feedback

@router.put("/feedback/{feedback_id}", response_model=schemas.Feedback)
def update_feedback(
    feedback_id: int,
    feedback: schemas.FeedbackUpdate,
    current_user: models.User = Depends(auth.get_current_manager),
    db: Session = Depends(get_db)
):
    db_feedback = db.query(models.Feedback).filter(models.Feedback.id == feedback_id).first()
    
    if not db_feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")
    
    # Check if manager is the one who created the feedback
    if db_feedback.manager_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to modify this feedback"
        )
    
    # Update feedback fields
    for key, value in feedback.dict(exclude_unset=True).items():
        setattr(db_feedback, key, value)
    
    db_feedback.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_feedback)
    
    return db_feedback

@router.put("/feedback/{feedback_id}/acknowledge", response_model=schemas.Feedback)
def acknowledge_feedback(
    feedback_id: int,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    feedback = db.query(models.Feedback).filter(models.Feedback.id == feedback_id).first()
    
    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")
      # Check if this is the employee who received the feedback
    if feedback.employee_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to acknowledge this feedback"
        )
    
    feedback.is_acknowledged = True
    db.commit()
    db.refresh(feedback)
    
    # Send notification to manager
    notifications.notify_feedback_acknowledged(db, feedback)
    
    return feedback

@router.post("/feedback/{feedback_id}/comments/", response_model=schemas.FeedbackComment)
def create_feedback_comment(
    feedback_id: int,
    comment: schemas.FeedbackCommentCreate,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    feedback = db.query(models.Feedback).filter(models.Feedback.id == feedback_id).first()
    
    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")
      # Check if user is authorized to comment on this feedback
    if (current_user.role == models.UserRole.EMPLOYEE and feedback.employee_id != current_user.id) or \
       (current_user.role == models.UserRole.MANAGER and feedback.manager_id != current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to comment on this feedback"
        )
    
    db_comment = models.FeedbackComment(
        feedback_id=feedback_id,
        comment=comment.comment
    )
    
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    
    # Send notification about the comment
    notifications.notify_new_comment(db, db_comment, feedback)
    
    return db_comment
