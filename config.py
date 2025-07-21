import os
from dotenv import load_dotenv

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
LLM_MODEL = os.getenv("GPT_MODEL", "gpt-4.1-nano")

EMBEDDING_MODEL = "text-embedding-ada-002"
VECTOR_DB_PATH = "embeddings/vector_store/"

REDDIT_CLIENT_ID = os.getenv("REDDIT_CLIENT_ID")
REDDIT_CLIENT_SECRET = os.getenv("REDDIT_CLIENT_SECRET")
REDDIT_USER_AGENT = os.getenv("REDDIT_USER_AGENT")

LANGSMITH_API_KEY = os.getenv("LANGSMITH_API_KEY")
LANGCHAIN_TRACING_V2 = os.getenv("LANGCHAIN_TRACING_V2", "true")
LANGSMITH_PROJECT = os.getenv("LANGSMITH_PROJECT", "Varys")

DB_CONNECTION_URL = os.getenv("DB_CONNECTION_URL")