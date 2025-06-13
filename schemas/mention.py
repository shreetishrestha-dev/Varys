from pydantic import BaseModel
from typing import Optional, List

class Mention(BaseModel):
    company: str
    source: str
    type: str
    sentiment: str
    keywords: Optional[List[str]] = []
    text: str
    translated: Optional[str] = None
    rating: Optional[float] = None