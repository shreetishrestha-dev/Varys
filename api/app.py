from fastapi import FastAPI, Query
from typing import Optional
from tools.retrieve_mentions_tool import retrieve_mentions

from sqlalchemy import text
from services.db_setup import engine

app = FastAPI()

@app.get("/")
def index():
    return {"message": "Company Review API is running 🚀"}

@app.get("/mentions")
def get_mentions(
    company: str = Query(...),
    type: Optional[str] = Query(None),
    sentiment: Optional[str] = Query(None),
    keyword: Optional[str] = Query(None),
    limit: int = Query(10)
):
    input_data = {"company": company, "limit": limit}
    if type is not None:
        input_data["type"] = type
    if sentiment is not None:
        input_data["sentiment"] = sentiment
    if keyword is not None:
        input_data["keyword"] = keyword

    return retrieve_mentions.invoke(input_data)

@app.get("/sentiment-breakdown")
def sentiment_breakdown(company: str):
    query = """
        SELECT sentiment, COUNT(*) as count
        FROM mentions
        WHERE company = :company
        GROUP BY sentiment
        ORDER BY count DESC
    """
    with engine.connect() as conn:
        result = conn.execute(text(query), {"company": company}).fetchall()
        return [{"sentiment": row[0], "count": row[1]} for row in result]
    
@app.get("/mention-types")
def mention_type_breakdown(company: str):
    query = """
        SELECT type, COUNT(*) as count
        FROM mentions
        WHERE company = :company
        GROUP BY type
        ORDER BY count DESC
    """
    with engine.connect() as conn:
        result = conn.execute(text(query), {"company": company}).fetchall()
        return [{"type": row[0], "count": row[1]} for row in result]