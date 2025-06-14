import json
from agents.mention_insert_agent import agent_executor
from schemas.mention import Mention
from services.db_setup import create_mentions_table
from langsmith import trace

def populate_mentions(company: str):
    create_mentions_table()  # Ensure table is created and truncated

    path = f"data/processed/enriched_mentions_{company}.json"

    with open(path, "r", encoding="utf-8") as f:
        mentions = json.load(f)

    with trace(
        name="populate_mentions_agentically",
        metadata={"company": company, "mention_count": len(mentions)},
        tags=["population", "agent", "mentions"]
    ):
        for i, mention in enumerate(mentions):
            print(f"\n🔄 Inserting mention {i+1}/{len(mentions)}...")
            mention["company"] = company
            if isinstance(mention.get("keywords"), str):
                mention["keywords"] = [kw.strip() for kw in mention["keywords"].split(",")]

            try:
                parsed = Mention(**mention)
                with trace(
                    name="insert_single_mention",
                    metadata={"mention_index": i, "company": parsed.company, "type": parsed.type},
                    tags=["mention", "insert"]
                ):
                    agent_executor.invoke({"input": parsed.model_dump()})
            except Exception as e:
                print(f"❌ Failed to insert mention {i+1}: {e}")