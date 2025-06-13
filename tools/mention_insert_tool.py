from langchain_core.tools import tool
from sqlalchemy import text
from services.db_setup import engine
from schemas.mention import Mention
from langsmith import trace
import json

@tool
def insert_mention(data: Mention) -> str:
    """
    Inserts a single Reddit mention into PostgreSQL.
    """
    with trace(
        name="insert_mention_tool",
        metadata={"company": data.company, "type": data.type, "sentiment": data.sentiment, "keywords": data.keywords},
        tags=["tool", "db", "insert"]
    ):
        with engine.connect() as conn:
            result = conn.execute(
                text("SELECT 1 FROM mentions WHERE company = :company AND text = :text LIMIT 1"),
                {"company": data.company, "text": data.text}
            ).fetchone()

            if result:
                return f"⚠️ Mention for {data.company} already exists. Skipped."
            
            conn.execute(
                text("""
                    INSERT INTO mentions (company, source, type, sentiment, keywords, text, translated, rating)
                    VALUES (:company, :source, :type, :sentiment, :keywords, :text, :translated, :rating)
                """),
                {
                    "company": data.company,
                    "source": data.source,
                    "type": data.type,
                    "sentiment": data.sentiment,
                    "keywords": json.dumps(data.keywords),
                    "text": data.text,
                    "translated": data.translated,
                    "rating": data.rating,
                }
            )
            conn.commit()
    return f"✅ Inserted mention for {data.company}"