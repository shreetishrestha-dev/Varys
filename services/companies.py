from sqlalchemy.orm import Session
from datetime import datetime
from services.db_setup import engine
from models.companies import Company

def set_company_status(name: str, status: str, log_file: str = None):
    with Session(engine) as session:
        company = session.get(Company, name)
        if company:
            company.status = status
            company.updated_at = datetime.utcnow()
            if log_file:
                company.log_file = log_file
        else:
            company = Company(
                name=name,
                status=status,
                log_file=log_file
            )
            session.add(company)
        session.commit()

def get_company_status(name: str):
    with Session(engine) as session:
        company = session.get(Company, name)
        return company.status if company else None
