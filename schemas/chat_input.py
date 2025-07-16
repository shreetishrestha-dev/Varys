from pydantic import BaseModel

class ChatInput(BaseModel):
    company: str
    query: str
    session_id: str