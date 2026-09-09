from typing import Generator
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from app.db.session import SessionLocal
from app.db.session import SessionLocal

def get_db() -> Generator:
    try:
        db = SessionLocal()
        yield db
    finally:
        db.close()

security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        # In a real production app, verify the signature using SUPABASE_JWT_SECRET
        payload = jwt.decode(token, "secret", options={"verify_signature": False})
        user_id: str = payload.get("sub")
        
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
            
        return {
            "user_id": user_id, 
            "role": payload.get("user_metadata", {}).get("role", "ASHA Worker"),
            "email": payload.get("email", "")
        }
    except JWTError:
        raise HTTPException(status_code=401, detail="Could not validate credentials")
