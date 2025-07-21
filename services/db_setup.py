from sqlalchemy import create_engine, text
from config import DB_CONNECTION_URL
from sqlalchemy.orm import declarative_base

Base = declarative_base()

engine = create_engine(DB_CONNECTION_URL)

def setup_tables():
    create_companies_table()
    create_mentions_table()
    create_chat_sessions_table()

def create_mentions_table():
    with engine.connect() as conn:
        result = conn.execute(text("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'mentions'
            )
        """))
        if result.scalar():
            print("Table 'mentions' already exists.")
            return

        conn.execute(text("""
        CREATE TABLE mentions (
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
        conn.commit()
        print("Table 'mentions' created.")

def create_chat_sessions_table():
    with engine.connect() as conn:
        result = conn.execute(text("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'chat_sessions'
            )
        """))
        if result.scalar():
            print("Table 'chat_sessions' already exists.")
            return

        conn.execute(text("""
        CREATE TABLE chat_sessions (
            id SERIAL PRIMARY KEY,
            session_id TEXT,
            company TEXT,
            role TEXT, -- 'user' or 'ai'
            message TEXT,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """))
        conn.commit()
        print("Table 'chat_sessions' created.")
        
def create_companies_table():
    with engine.connect() as conn:
        result = conn.execute(text("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'companies'
            )
        """))
        if result.scalar():
            print("Table 'companies' already exists.")
            return

        conn.execute(text("""
            CREATE TABLE companies (
                name TEXT PRIMARY KEY,
                status TEXT DEFAULT 'preparing',
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                log_file TEXT
            )
        """))
        conn.commit()
        print("Table 'companies' created.")