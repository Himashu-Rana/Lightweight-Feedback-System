# Feedback System

A lightweight internal feedback sharing system between managers and team members. This application enables structured, ongoing feedback in a simple, secure, and friendly interface.

## Features

### Core Features (MVP)

1. **Authentication & Roles**
   * Two user roles: Manager and Employee
   * Basic login system
   * A manager can only see their team members

2. **Feedback Submission**
   * A manager can submit structured feedback for each team member:
     * Strengths
     * Areas to improve
     * Overall sentiment (positive/neutral/negative)
   * Multiple feedbacks per employee
   * Feedback history visible to both manager and employee

3. **Feedback Visibility**
   * Employees can see feedback they've received
   * They cannot see other employees' data
   * Managers can edit/update their past feedback
   * Employees can acknowledge feedback they have read

4. **Dashboard**
   * For a manager: team overview (feedback count, sentiment trends)
   * For an employee: timeline of feedback received

### Additional Features

* Employee can request feedback proactively
* Comments on feedback
* Markdown support for comments

## Technology Stack

* **Frontend**: React with Material-UI
* **Backend**: Python FastAPI
* **Database**: SQLite (can be easily switched to PostgreSQL)
* **Authentication**: JWT based authentication

## Project Structure

```
feedback-system/
├── backend/               # FastAPI backend
│   ├── app/               # Application code
│   │   ├── routers/       # API endpoints
│   │   ├── models.py      # Database models
│   │   ├── schemas.py     # Pydantic schemas
│   │   ├── auth.py        # Authentication logic
│   │   └── database.py    # Database connection
│   ├── main.py            # FastAPI application entry point
│   ├── requirements.txt   # Backend dependencies
│   └── Dockerfile         # Docker configuration for backend
│
└── frontend/              # React frontend
    ├── public/            # Static files
    └── src/               # Source files
        ├── components/    # Reusable components
        ├── context/       # React context (Auth)
        ├── pages/         # Application pages
        └── services/      # API services
```

## Running the Application

### Backend

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Create a virtual environment:
   ```
   python -m venv venv
   ```

3. Activate the virtual environment:
   - On Windows:
     ```
     venv\Scripts\activate
     ```
   - On macOS/Linux:
     ```
     source venv/bin/activate
     ```

4. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

5. Initialize the database with sample data (optional):
   ```
   python init_db.py
   ```

6. Run the application:
   ```
   uvicorn main:app --reload
   ```

### Frontend

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

### Docker

You can also run the backend using Docker:

```
cd backend
docker build -t feedback-system-backend .
docker run -p 8000:8000 feedback-system-backend
```

## API Documentation

Once the backend is running, access the API documentation at:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
