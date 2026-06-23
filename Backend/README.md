# CampusEcho V1 - Backend Services

FastAPI and Supabase python-powered backend services supporting role-based access controls, authentications, noticeboards, event trackers, assignment dashboards, and lecturer portal services.

## Architecture & Frameworks

- **fastapi**: Highly performant, asynchronous API gateway.
- **supabase**: Authentication, user metadata, and Firestore-like relational PostgreSQL queries.
- **pydantic**: JSON request-response serialization and schema mapping.
- **jose/pyjwt**: Multi-role security and localized RBAC assertions wrapper.

## Directory Structure

```text
backend/
├── app/
│   ├── main.py
│   ├── core/
│   │   ├── config.py
│   │   └── security.py
│   ├── routes/
│   │   ├── auth.py
│   │   ├── profiles.py
│   │   ├── timetable.py
│   │   ├── notices.py
│   │   ├── events.py
│   │   ├── assignments.py
│   │   ├── notifications.py
│   │   ├── lecturers.py
│   │   └── admin.py
│   ├── services/
│   │   ├── supabase_service.py
│   │   ├── notification_service.py
│   │   ├── profile_service.py
│   │   └── timetable_service.py
│   └── schemas/
│       ├── auth.py
│       ├── profile.py
│       ├── timetable.py
│       ├── notice.py
│       ├── event.py
│       ├── assignment.py
│       └── notification.py
├── .env.example
├── requirements.txt
└── README.md
```

## Setup & Execution

### 1. Configure Python Virtual Environment
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and fill with your Supabase credentials.
```bash
cp .env.example .env
```

### 3. Start Development Server
```bash
uvicorn app.main:app --reload --port 8000
```
Open [http://localhost:8000/docs](http://localhost:8000/docs) in your browser to view the interactive OpenAPI documentation.
