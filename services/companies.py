from sqlalchemy.orm import Session
from datetime import datetime
from services.db_setup import engine
from models.companies import Company

def set_company_status(name: str, status: str):
    with Session(engine) as session:
        company = session.get(Company, name)
        if company:
            company.status = status
            company.updated_at = datetime.utcnow()
        else:
            company = Company(name=name, status=status)
            session.add(company)
        session.commit()

def get_company_status(name: str):
    with Session(engine) as session:
        company = session.get(Company, name)
        return company.status if company else None
