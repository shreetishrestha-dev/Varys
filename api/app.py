from fastapi import FastAPI, Query, HTTPException
from typing import Optional
from tools.retrieve_mentions_tool import retrieve_mentions
from pydantic import BaseModel
from services.rag.chat import get_rag_response


from sqlalchemy import text
from services.db_setup import engine

from fastapi.middleware.cors import CORSMiddleware

from schemas.chat_input import ChatInput

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
    
@app.post("/chat")
def chat_with_rag(input: ChatInput):
    answer = get_rag_response(
        company=input.company,
        query=input.query,
        session_id=input.session_id
    )
    return {"answer": answer}

@app.get("/keywords-breakdown")
def keywords_breakdown(company: str):
    query = """
        SELECT keywords
        FROM mentions
        WHERE company = :company
    """
    with engine.connect() as conn:
        result = conn.execute(text(query), {"company": company}).fetchall()
        keywords = []
        for row in result:
            keywords.extend(row[0] if isinstance(row[0], list) else [])
        from collections import Counter
        counter = Counter(keywords)
        return [{"keyword": k, "count": v} for k, v in counter.most_common()]

@app.get("/companies")
def get_companies():
    query = """
        SELECT DISTINCT company FROM mentions
    """
    with engine.connect() as conn:
        result = conn.execute(text(query)).fetchall()
        return [row[0] for row in result]