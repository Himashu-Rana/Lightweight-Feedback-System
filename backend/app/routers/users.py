from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from .. import models, schemas, auth
from ..database import get_db

router = APIRouter()

# Public endpoint to get all managers for registration
@router.get("/managers/", response_model=List[schemas.User])
def read_managers(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    managers = db.query(models.User).filter(
        models.User.role == models.UserRole.MANAGER
    ).offset(skip).limit(limit).all()
    return managers

@router.post("/users/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    # Check if user with email already exists
    existing_user = db.query(models.User).filter(models.User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Check if manager ID is valid if provided
    if user.manager_id:
        manager = db.query(models.User).filter(
            models.User.id == user.manager_id,
            models.User.role == models.UserRole.MANAGER
        ).first()
        if not manager:
            raise HTTPException(status_code=400, detail="Invalid manager ID")
    
    # Create new user
    hashed_password = auth.get_password_hash(user.password)
    db_user = models.User(
        email=user.email,
        full_name=user.full_name,
        hashed_password=hashed_password,
        role=user.role,
        manager_id=user.manager_id
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.get("/users/me/", response_model=schemas.User)
def read_user_me(current_user: models.User = Depends(auth.get_current_active_user)):
    return current_user

@router.put("/users/me/", response_model=schemas.User)
def update_user_me(user: schemas.UserUpdate, 
                 current_user: models.User = Depends(auth.get_current_active_user),
                 db: Session = Depends(get_db)):
    # Update user data
    if user.email:
        current_user.email = user.email
    if user.full_name:
        current_user.full_name = user.full_name
    if user.password:
        current_user.hashed_password = auth.get_password_hash(user.password)
    
    db.commit()
    db.refresh(current_user)
    return current_user

@router.get("/users/", response_model=List[schemas.User])
def read_users(skip: int = 0, limit: int = 100, 
              current_user: models.User = Depends(auth.get_current_manager),
              db: Session = Depends(get_db)):
    # If user is manager, only return their employees
    users = db.query(models.User).filter(
        models.User.manager_id == current_user.id
    ).offset(skip).limit(limit).all()
    return users

@router.get("/users/{user_id}", response_model=schemas.User)
def read_user(user_id: int, 
             current_user: models.User = Depends(auth.get_current_active_user),
             db: Session = Depends(get_db)):
    # Allow access to own data
    if current_user.id == user_id:
        user = db.query(models.User).filter(models.User.id == user_id).first()
        if user is None:
            raise HTTPException(status_code=404, detail="User not found")
        return user
    
    # Allow employees to access their manager's data (needed for feedback details)
    if current_user.role == models.UserRole.EMPLOYEE and current_user.manager_id == user_id:
        manager = db.query(models.User).filter(models.User.id == user_id).first()
        if manager is None:
            raise HTTPException(status_code=404, detail="Manager not found")
        return manager
    
    # Allow employees to access info for managers who gave them feedback
    if current_user.role == models.UserRole.EMPLOYEE:
        # Check if this user has given feedback to the current employee
        feedback_exists = db.query(models.Feedback).filter(
            models.Feedback.manager_id == user_id,
            models.Feedback.employee_id == current_user.id
        ).first() is not None
        
        if feedback_exists:
            manager = db.query(models.User).filter(models.User.id == user_id).first()
            if manager is None:
                raise HTTPException(status_code=404, detail="User not found")
            return manager
        else:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access this user's data"
            )
    
    # If user is manager, check if employee belongs to them
    if current_user.role == models.UserRole.MANAGER and current_user.id != user_id:
        employee = db.query(models.User).filter(
            models.User.id == user_id,
            models.User.manager_id == current_user.id
        ).first()
        if not employee:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found or not managed by you"
            )
        return employee
    
    # User is accessing their own data or manager is accessing their own data
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user
