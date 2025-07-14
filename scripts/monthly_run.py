# scripts/monthly_run.py

import argparse
from scrapers.reddit_scraper import scrape
from services.gather_reddit_mentions import gather_mentions_from_reddit
from services.preprocess_mentions import preprocess_mentions
from utils.io import save_json

def main():
    parser = argparse.ArgumentParser(description="Monthly review scraper and preprocessor")
    parser.add_argument("company", help="Company name to track")
    parser.add_argument("--populate", action="store_true", help="Populate DB after preprocessing")
    args = parser.parse_args()

    company = args.company

    print(f"🔄 Scraping Reddit for {company}...")
    scrape(company)

    print(f"📥 Gathering structured mentions...")
    raw_path = f"data/raw/reddit_{company}.json"
    mentions = gather_mentions_from_reddit(raw_path, company)
    save_json(mentions, f"reddit_mentions_{company}.json", folder="data/processed")

    print(f"🧠 Preprocessing...")
    preprocess_mentions(company)

    if args.populate:
        from services.populate_mentions_agentically import populate_mentions
        print(f"🗃️ Populating DB...")
        populate_mentions(company)

    print("✅ Monthly run complete.")

if __name__ == "__main__":
    main()