import json
from tqdm import tqdm
from chains.preprocessing_chain import get_preprocessing_chain
from langsmith import trace
from config import LANGSMITH_PROJECT

def preprocess_mentions(company: str):
    input_file = f"data/processed/reddit_mentions_{company}.json"
    output_file = f"data/processed/enriched_mentions_{company}.json"

    with open(input_file, "r", encoding="utf-8") as f:
        data = json.load(f)

    enriched = []
    with trace(
        name="preprocess_mentions",
        metadata={
            "company": company,
            "input_file": input_file,
            "output_file": output_file,
            "num_mentions": len(data),
        },
        tags=["preprocessing", "mentions"],
        project_name=LANGSMITH_PROJECT,
    ):
        chain = get_preprocessing_chain(company)
        for item in tqdm(data, desc="Preprocessing"):
            with trace(
                name="preprocess_single_mention",
                metadata={"mention_id": item.get("id"), "text": item.get("text")},
                tags=["mention"],
            ):
                result = chain.invoke({"text": item["text"]})
                cleaned = {key: value.content if hasattr(value, "content") else value for key, value in result.items()}
                enriched.append({**item, **cleaned})

    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(enriched, f, indent=2, ensure_ascii=False)

    print(f"✅ Preprocessing complete. Saved to {output_file}")