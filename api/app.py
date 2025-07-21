from typing import Optional
from requests import Session
from sqlalchemy import text

from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse

from models.companies import Company
from tools.retrieve_mentions_tool import retrieve_mentions

from services.rag.chat import get_rag_response, get_memory
from services.db_setup import engine
from services.companies import get_company_status, set_company_status

from schemas.chat_input import ChatInput
from schemas.script_run_request import ScriptRunRequest

from config import DB_CONNECTION_URL

import subprocess
import os
import time

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
    print("db", DB_CONNECTION_URL)
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

@app.get("/chat/history")
def get_chat_history(company: str = Query(...), session_id: str = Query(...)):
    history = get_memory(session_id=session_id, company=company)
    return {"history": [{"role": r, "message": m} for r, m in history]}

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
    

@app.post("/run-script")
def run_company_script(request: ScriptRunRequest):
    try:
        log_dir = "logs"
        os.makedirs(log_dir, exist_ok=True)
        filename = f"{request.company}_{int(time.time())}.log"
        log_file = os.path.join(log_dir, f"{request.company}_{int(time.time())}.log")

        command = ["python", "main.py", request.company, f"--limit={request.limit}", f"--log-file={filename}"]
        if request.all_steps:
            command.append("--all")

        with open(log_file, "w") as f:
            process = subprocess.Popen(command, stdout=f, stderr=subprocess.STDOUT, text=True)

        return {
            "command": " ".join(command),
            "message": f"Script for '{request.company}' started successfully.",
            "pid": process.pid,
            "log_file": log_file,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.get("/logs/{logfile}")
def get_log_file(logfile: str):
    log_path = os.path.join("logs", logfile)
    if not os.path.isfile(log_path):
        raise HTTPException(status_code=404, detail="Log file not found")
    with open(log_path, "r") as f:
        log_content = f.read()
    return PlainTextResponse(content=log_content)

@app.get("/company/status")
def check_status(company: str):
    return {"status": get_company_status(company)}

@app.get("/chat/all-history")
def get_all_chat_histories(company: str = Query(...)):
    query = """
        SELECT session_id, role, message, timestamp
        FROM chat_sessions
        WHERE company = :company
        ORDER BY session_id, timestamp
    """
    with engine.connect() as conn:
        result = conn.execute(text(query), {"company": company}).fetchall()

    from collections import defaultdict
    grouped = defaultdict(list)
    for session_id, role, message, timestamp in result:
        grouped[session_id].append({
            "role": role,
            "message": message,
            "timestamp": timestamp.isoformat() if hasattr(timestamp, "isoformat") else timestamp
        })

    return {"histories": dict(grouped)}

@app.get("/chat/recent-questions")
def get_recent_questions(company: str = Query(...), limit: int = Query(10)):
    query = """
        SELECT DISTINCT ON (message) message, timestamp
        FROM chat_sessions
        WHERE company = :company AND role = 'user'
        ORDER BY message, timestamp DESC
        LIMIT :limit
    """
    with engine.connect() as conn:
        result = conn.execute(text(query), {"company": company, "limit": limit}).fetchall()
        return {"questions": [row[0] for row in result]}


# New route to fetch active processes from the backend
@app.get("/companies/active-processes")
def get_active_processes():
    query = """
        SELECT name, status, updated_at, log_file
        FROM companies
        WHERE status NOT IN ('Completed', 'Failed')
        ORDER BY updated_at DESC
    """
    with engine.connect() as conn:
        result = conn.execute(text(query)).fetchall()
        return [
            {
                "company": row[0],
                "status": row[1],
                "lastUpdated": row[2].isoformat() if hasattr(row[2], "isoformat") else row[2],
                "log_file": row[3],
                "currentStatus": row[1],
                "startTime": row[2],
                "isCompleted": row[1] == "RAG Retriever Ready"
            }
            for row in result
        ]
        
@app.get("/logs/list")
def list_log_files(company: str = Query(...)):
    """List all log files for a specific company"""
    try:
        log_dir = "logs"
        if not os.path.exists(log_dir):
            return []
        
        # Find all log files for this company
        log_files = []
        for filename in os.listdir(log_dir):
            if filename.startswith(f"{company}_") and filename.endswith(".log"):
                log_path = os.path.join(log_dir, filename)
                if os.path.isfile(log_path):
                    # Get file stats
                    stat = os.stat(log_path)
                    log_files.append({
                        "filename": filename,
                        "path": f"logs/{filename}",
                        "size": stat.st_size,
                        "created": stat.st_ctime,
                        "modified": stat.st_mtime
                    })
        
        # Sort by creation time, newest first
        log_files.sort(key=lambda x: x["created"], reverse=True)
        return log_files
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))