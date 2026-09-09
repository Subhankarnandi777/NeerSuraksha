from typing import Optional
from pydantic import BaseModel

class UserBase(BaseModel):
    name: str
    phone: str
    role: str
    villageName: str

class UserCreate(UserBase):
    id: str

class UserUpdate(UserBase):
    pass

class User(UserBase):
    id: str
    is_active: bool

    class Config:
        from_attributes = True
