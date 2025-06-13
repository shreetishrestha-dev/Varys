import json
import os

def gather_mentions_from_reddit(file_path: str, company_name: str):
    with open(file_path, "r", encoding="utf-8") as f:
        raw_data = json.load(f)

    results = []
    company_lower = company_name.lower()

    for entry in raw_data:
        post_text = entry.get("review", "")
        if company_lower in post_text.lower():
            results.append({
                "source": "Reddit",
                "text": post_text,
                "type": "post"
            })

        for comment in entry.get("comments", []):
            if company_lower in comment.lower():
                results.append({
                    "source": "Reddit",
                    "text": comment,
                    "type": "comment"
                })

    return results