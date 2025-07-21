from sqlalchemy import Column, String, DateTime, Enum
from sqlalchemy.orm import declarative_base
from datetime import datetime

Base = declarative_base()

class Company(Base):
    __tablename__ = "companies"

    name = Column(String, primary_key=True)
    status = Column(String, nullable=False, default="Preparing")
    log_file = Column(String, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow)

