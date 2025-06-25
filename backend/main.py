from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from datetime import datetime

from app.database import engine, Base
from app.routers import users, auth, feedback, dashboard, feedback_requests, notifications

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Feedback System API")

# Add CORS middleware
origins = [
    "http://localhost",
    "http://localhost:3000",  # React default port
    "http://localhost:4000",  # Our current frontend port
    "http://localhost:5000",  # Alternative port
    "*",  # Allow all origins temporarily to fix connection issues
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, tags=["authentication"])
app.include_router(users.router, prefix="/api", tags=["users"])
app.include_router(feedback.router, prefix="/api", tags=["feedback"])
app.include_router(feedback_requests.router, prefix="/api", tags=["feedback-requests"])
app.include_router(dashboard.router, prefix="/api", tags=["dashboard"])
app.include_router(notifications.router, prefix="/api", tags=["notifications"])

@app.get("/")
async def root():
    return {"message": "Welcome to the Feedback System API. Use /docs for the API documentation."}

@app.get("/ping")
async def ping_test():
    """A simple endpoint to test if the API is reachable."""
    return {"status": "success", "message": "API is running", "timestamp": datetime.now().isoformat()}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
