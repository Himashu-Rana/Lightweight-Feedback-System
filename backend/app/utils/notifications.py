from sqlalchemy.orm import Session
from .. import models

def notify_new_feedback(db: Session, feedback: models.Feedback):
    """
    Send notification when new feedback is created
    """
    try:
        # Create a notification record
        notification = models.Notification(
            user_id=feedback.employee_id,
            message=f"You have received new feedback from {feedback.manager.full_name}",
            read=False,
            related_feedback_id=feedback.id
        )
        db.add(notification)
        db.commit()
        
        print(f"Notification: New feedback created for employee ID {feedback.employee_id}")
        return True
    except Exception as e:
        print(f"Error creating notification: {e}")
        return False

def notify_feedback_acknowledged(db: Session, feedback: models.Feedback):
    """
    Send notification when feedback is acknowledged
    """
    try:
        # Create a notification for the manager
        notification = models.Notification(
            user_id=feedback.manager_id,
            message=f"{feedback.employee.full_name} has acknowledged your feedback",
            read=False,
            related_feedback_id=feedback.id
        )
        db.add(notification)
        db.commit()
        
        print(f"Notification: Feedback acknowledged for manager ID {feedback.manager_id}")
        return True
    except Exception as e:
        print(f"Error creating notification: {e}")
        return False

def notify_feedback_request(db: Session, request: models.FeedbackRequest):
    """
    Send notification when a feedback request is created
    """
    try:
        # Get the employee to find the manager
        employee = db.query(models.User).filter(models.User.id == request.employee_id).first()
        if employee and employee.manager_id:
            # Create a notification for the manager
            notification = models.Notification(
                user_id=employee.manager_id,
                message=f"{employee.full_name} has requested feedback",
                read=False,
                related_request_id=request.id
            )
            db.add(notification)
            db.commit()
            
            print(f"Notification: Feedback requested by employee ID {request.employee_id}")
            return True
        return False
    except Exception as e:
        print(f"Error creating notification: {e}")
        return False

def notify_new_comment(db: Session, comment: models.FeedbackComment, feedback: models.Feedback):
    """
    Send notification when a comment is added to feedback
    """
    try:
        # Determine who to notify (if employee commented, notify manager and vice versa)
        current_user_id = comment.user_id if hasattr(comment, 'user_id') else None
        notify_user_id = None
        
        if current_user_id == feedback.manager_id:
            notify_user_id = feedback.employee_id
            sender = feedback.manager.full_name
        else:
            notify_user_id = feedback.manager_id
            sender = feedback.employee.full_name
            
        if notify_user_id:
            notification = models.Notification(
                user_id=notify_user_id,
                message=f"{sender} commented on feedback",
                read=False,
                related_feedback_id=feedback.id
            )
            db.add(notification)
            db.commit()
            
            print(f"Notification: Comment added for user ID {notify_user_id}")
            return True
        return False
    except Exception as e:
        print(f"Error creating notification: {e}")
        return False