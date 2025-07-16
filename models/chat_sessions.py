# models/chat_session.py

from sqlalchemy import Column, Integer, String, Text, DateTime
from datetime import datetime
from services.db_setup import Base

class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id = Column(Integer, primary_key=True)
    session_id = Column(String)
    company = Column(String)
    role = Column(String)
    message = Column(Text)
    timestamp = Column(DateTime, default=datetime.utcnow)