# scripts/embed_mentions_from_db.py

from sqlalchemy import text as sql_text
from services.db_setup import engine
from langchain_core.documents import Document
from langchain_community.vectorstores import FAISS

# Updated import to address LangChain deprecation warning
try:
    from langchain_openai import OpenAIEmbeddings
except ImportError:
    from langchain_community.embeddings import OpenAIEmbeddings

def build_vectorstore_from_db(company):
    with engine.connect() as conn:
        result = conn.execute(
            sql_text("""
                SELECT type, sentiment, keywords, text, translated
                FROM mentions
                WHERE company = :company
            """),
            {"company": company}
        ).fetchall()

    docs = []
    for row in result:
        page_content = row._mapping["translated"] or row._mapping["text"]
        if not page_content:
            continue

        docs.append(Document(
            page_content=page_content,
            metadata={
                "type": row._mapping["type"],
                "sentiment": row._mapping["sentiment"],
                "keywords": row._mapping["keywords"],
                "company": company
            }
        ))

    if not docs:
        print(f"⚠️ No documents found for {company}. Skipping vectorstore creation.")
        return

    embeddings = OpenAIEmbeddings(model="text-embedding-ada-002")
    vectorstore = FAISS.from_documents(docs, embeddings)
    vectorstore.save_local(f"vectorstores/{company.lower()}_mentions")

    print(f"✅ Saved vector store for {company} ({len(docs)} documents)")

if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        print("❌ Please provide a company name as an argument.")
    else:
        build_vectorstore_from_db(sys.argv[1])
