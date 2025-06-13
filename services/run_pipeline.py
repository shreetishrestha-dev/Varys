from services.gather_reddit_mentions import gather_mentions_from_reddit
from utils.io import save_json

def run_info_gathering(company: str):
    raw_path = f"data/raw/reddit_{company}.json"
    mentions = gather_mentions_from_reddit(raw_path, company)
    save_json(mentions, f"reddit_mentions_{company}.json", folder="data/processed")
    print(f"✅ Gathered {len(mentions)} Reddit mentions for {company}")