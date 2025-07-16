from pydantic import BaseModel

class ScriptRunRequest(BaseModel):
    company: str
    limit: int = 100
    all_steps: bool = True