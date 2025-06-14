from langchain_core.tools import tool
from sqlalchemy import text
from services.db_setup import engine

@tool
def retrieve_mentions(company: str, type: str = None, sentiment: str = None, keyword: str = None, limit: int = 10) -> list:
    """
    Retrieve mentions from the database by filters.
    Filters include: company (required), type, sentiment, keyword, and result limit.
    Returns a list of matching records.
    """

    query = """
    SELECT company, type, sentiment, keywords, text, translated, rating
    FROM mentions
    WHERE company = :company
    """
    params = {"company": company}

    if type:
        query += " AND type = :type"
        params["type"] = type

    if sentiment:
        query += " AND sentiment = :sentiment"
        params["sentiment"] = sentiment

    if keyword:
        query += " AND keywords::text ILIKE :keyword"
        params["keyword"] = f"%{keyword}%"

    query += " ORDER BY id DESC LIMIT :limit"
    params["limit"] = limit

    with engine.connect() as conn:
        results = conn.execute(text(query), params).fetchall()

    seen_texts = set()
    unique_results = []
    for row in results:
        text_content = row._mapping["text"]
        if text_content not in seen_texts:
            seen_texts.add(text_content)
            unique_results.append(dict(row._mapping))

    return unique_results