from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.routes import auth, profiles, timetable, notices, events, assignments, notifications, lecturers, admin
import logging

# Configure Logging settings
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("campusecho_v1")

app = FastAPI(
    title=settings.APP_NAME,
    description="CampusEcho high-end FastAPI and Supabase relational academic operations gateway.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS middleware to allow cross-origin requests from our React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Supports wildcards for decoupled hosting or local/preview containers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Setup Global Exception Handlers to always return conformant JSON
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Internal unexpected trigger error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Something went wrong on the server side logs. Please try again soon."}
    )

# Basic status health-checks
@app.get("/", tags=["Health"])
def root_endpoint():
    """
    Service health identifier and description packet info.
    """
    return {
        "status": "online",
        "service": settings.APP_NAME,
        "environment": settings.APP_ENV,
        "version": "1.0.0",
        "supabase_connection": "configured" if settings.SUPABASE_URL else "unconfigured"
    }

# Register individual modules and endpoints from routers
app.include_router(auth.router)
app.include_router(profiles.router)
app.include_router(timetable.router)
app.include_router(notices.router)
app.include_router(events.router)
app.include_router(assignments.router)
app.include_router(notifications.router)
app.include_router(lecturers.router)
app.include_router(admin.router)
