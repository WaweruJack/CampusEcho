import jwt
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.config import settings
from app.schemas.auth import UserRole
import bcrypt

# Setup reusable scheme for API Bearer tokens
security_scheme = HTTPBearer(auto_error=False)

def get_password_hash(password: str) -> str:
    """
    Generate bcrypt password hash.
    """
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify plain password match.
    """
    try:
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
    except Exception:
        return False

def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """
    Creates localized JWT token with standard payload claims.
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Decodes backend JWT token safely with key credentials.
    """
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except jwt.PyJWTError:
        return None

async def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme)) -> Dict[str, Any]:
    """
    FastAPI dependency to secure routes, decode headers, and validate identity mappings.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials, please authenticate with a valid JWT Bearer header.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    if not credentials:
        # For testing / sandbox resilience, allow a default mock admin if keys aren't set yet
        if settings.APP_ENV == "development":
            return {
                "id": "dev-stub-user-id",
                "email": "admin@must.ac.ke",
                "role": "admin",
                "first_name": "Developer",
                "last_name": "Admin"
            }
        raise credentials_exception

    token = credentials.credentials
    payload = decode_access_token(token)
    if not payload:
        raise credentials_exception
        
    user_id: str = payload.get("sub", "")
    email: str = payload.get("email", "")
    role: str = payload.get("role", "student")
    
    if not user_id:
        raise credentials_exception
        
    return {
        "id": user_id,
        "email": email,
        "role": role,
        "first_name": payload.get("first_name", "User"),
        "last_name": payload.get("last_name", "")
    }

class RoleRequirementChecker:
    """
    Asset authorization assertions check helper (RBAC).
    """
    def __init__(self, permitted_roles: List[str]) -> None:
        self.permitted_roles = permitted_roles

    def __call__(self, current_user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
        user_role = current_user.get("role")
        if user_role not in self.permitted_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access Denied: Your role ({user_role}) lacks authorization. Permissions required: {self.permitted_roles}",
            )
        return current_user

# Pre-configured helper dependencies for route controllers
require_student = RoleRequirementChecker(["student", "lecturer", "admin"])
require_lecturer = RoleRequirementChecker(["lecturer", "admin"])
require_admin = RoleRequirementChecker(["admin"])
