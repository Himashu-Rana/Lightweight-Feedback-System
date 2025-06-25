import os
import sys
from datetime import datetime, timedelta

# Add the parent directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import engine, Base, SessionLocal
from app.models import User, Feedback, UserRole, FeedbackSentiment
from app.auth import get_password_hash

# Create tables
Base.metadata.create_all(bind=engine)

def init_db():
    db = SessionLocal()
    
    try:
        # Force drop all tables and recreate them
        print("Dropping all tables and recreating schema...")
        Base.metadata.drop_all(bind=engine)
        Base.metadata.create_all(bind=engine)
        
        # Create test users
        print("Creating test users...")
        
        # Managers
        manager1 = User(
            email="manager1@example.com",
            full_name="John Manager",
            hashed_password=get_password_hash("password"),
            role=UserRole.MANAGER,
            is_active=True
        )
        db.add(manager1)
        
        manager2 = User(
            email="manager2@example.com",
            full_name="Sarah Director",
            hashed_password=get_password_hash("password"),
            role=UserRole.MANAGER,
            is_active=True
        )
        db.add(manager2)
        
        # Commit to get IDs
        db.commit()
        
        # Employees
        employees = [
            User(
                email="employee1@example.com",
                full_name="Alice Employee",
                hashed_password=get_password_hash("password"),
                role=UserRole.EMPLOYEE,
                manager_id=manager1.id,
                is_active=True
            ),
            User(
                email="employee2@example.com",
                full_name="Bob Worker",
                hashed_password=get_password_hash("password"),
                role=UserRole.EMPLOYEE,
                manager_id=manager1.id,
                is_active=True
            ),
            User(
                email="employee3@example.com",
                full_name="Charlie Dev",
                hashed_password=get_password_hash("password"),
                role=UserRole.EMPLOYEE,
                manager_id=manager2.id,
                is_active=True
            )
        ]
        
        db.add_all(employees)
        db.commit()
        
        # Add sample feedback
        print("Creating sample feedback...")
        
        # Feedback from John to Alice
        feedback1 = Feedback(
            content="Overall great performer who consistently meets expectations.",
            strengths="Alice has shown excellent communication skills. She is proactive in keeping the team informed about her progress and any blockers she encounters. Her documentation is thorough and clear.",
            areas_to_improve="Could benefit from more confidence when presenting ideas in larger meetings. Consider taking some time to prepare talking points before team discussions.",
            sentiment=FeedbackSentiment.POSITIVE,
            manager_id=manager1.id,
            employee_id=employees[0].id,
            is_anonymous=False,
            is_acknowledged=True,
            created_at=datetime.utcnow() - timedelta(days=30)
        )
        
        # Feedback from John to Bob
        feedback2 = Feedback(
            content="Good technical skills but needs to share knowledge more effectively.",
            strengths="Bob consistently delivers high-quality code. His technical skills are strong, and he's good at finding efficient solutions to complex problems.",
            areas_to_improve="Should work on sharing knowledge more with junior team members. Consider pairing up more frequently or leading a technical session.",
            sentiment=FeedbackSentiment.NEUTRAL,
            manager_id=manager1.id,
            employee_id=employees[1].id,
            is_anonymous=False,
            is_acknowledged=False,
            created_at=datetime.utcnow() - timedelta(days=15)
        )
        
        # Feedback from Sarah to Charlie
        feedback3 = Feedback(
            content="Delivers on time but code quality needs improvement.",
            strengths="Charlie takes ownership of tasks and sees them through to completion. Very reliable and consistently meets deadlines.",
            areas_to_improve="Need to improve code quality and follow team standards more closely. Take more time to review your PRs before submitting them.",
            sentiment=FeedbackSentiment.NEGATIVE,
            manager_id=manager2.id,
            employee_id=employees[2].id,
            is_anonymous=True,
            is_acknowledged=True,
            created_at=datetime.utcnow() - timedelta(days=7)
        )
        
        db.add_all([feedback1, feedback2, feedback3])
        db.commit()
        
        print("Database initialized successfully!")
        
    except Exception as e:
        print(f"Error initializing database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    init_db()
