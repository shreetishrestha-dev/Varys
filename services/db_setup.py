from sqlalchemy import create_engine, text
from config import DB_CONNECTION_URL

engine = create_engine(DB_CONNECTION_URL)

def create_mentions_table():
    with engine.connect() as conn:
        conn.execute(text("""
            DROP TABLE IF EXISTS mentions;
        """))
        conn.execute(text("""
        CREATE TABLE IF NOT EXISTS mentions (
            id SERIAL PRIMARY KEY,
            company TEXT,
            source TEXT,
            type TEXT,
            sentiment TEXT,
            keywords JSON,
            text TEXT,
            translated TEXT,
            rating FLOAT
        )
        """))
        conn.execute(text("""
            ALTER TABLE mentions ADD CONSTRAINT unique_company_text UNIQUE (company, text);
        """))
        conn.commit()