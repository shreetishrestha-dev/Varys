import argparse
from scrapers.run_scraping import run_scraping_for_company
from services.run_pipeline import run_info_gathering
from services.preprocess_mentions import preprocess_mentions


parser = argparse.ArgumentParser(description="Company Review Summarizer CLI")
parser.add_argument("company", help="Company name to search for")

args = parser.parse_args()

if args.scrape:
    run_scraping_for_company(company=args.company, limit=args.limit)

print(f"✅ Pipeline completed for {args.company}")