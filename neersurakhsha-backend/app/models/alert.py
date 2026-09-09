from sqlalchemy import Column, String, Boolean, Integer
from app.db.base_class import Base

class Alert(Base):
    __tablename__ = "alerts"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String)
    subtitle = Column(String)
    assignee = Column(String)
    loc = Column(String)
    due = Column(String)
    completed = Column(Boolean, default=False)
    critical = Column(Boolean, default=False)
