from fastapi import FastAPI, Query, HTTPException
from typing import Optional
from tools.retrieve_mentions_tool import retrieve_mentions
from pydantic import BaseModel
from services.rag.chat import get_rag_response


from sqlalchemy import text
from services.db_setup import engine

from fastapi.middleware.cors import CORSMiddleware

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
    
class ChatInput(BaseModel):
    company: str
    query: str

@app.post("/chat")
def chat_with_rag(input: ChatInput):
    try:
        answer = get_rag_response(company=input.company, query=input.query)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Vectorstore not found for this company.")
    return {"answer": answer}