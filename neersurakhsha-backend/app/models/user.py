from sqlalchemy import Column, String, Boolean
from app.db.base_class import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, index=True)
    name = Column(String)
    phone = Column(String, unique=True, index=True)
    role = Column(String)
    villageName = Column(String)
    is_active = Column(Boolean, default=True)
