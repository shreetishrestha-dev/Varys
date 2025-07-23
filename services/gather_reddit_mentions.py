import json
import os

def gather_mentions_from_reddit(file_path: str, company_name: str):
    with open(file_path, "r", encoding="utf-8") as f:
        raw_data = json.load(f)

    results = []
    company_lower = company_name.lower()
    seen_texts = set()

    for entry in raw_data:
        post_text = entry.get("review", "")
        if company_lower in post_text.lower():
            if post_text not in seen_texts:
                results.append({
                    "source": "Reddit",
                    "text": post_text,
                    "type": "post"
                })
                seen_texts.add(post_text)

        for comment in entry.get("comments", []):
            if company_lower in comment.lower():
                if comment not in seen_texts:
                    results.append({
                        "source": "Reddit",
                        "text": comment,
                        "type": "comment"
                    })
                    seen_texts.add(comment)

    return results