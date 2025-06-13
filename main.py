import argparse
from scrapers.run_scraping import run_scraping_for_company
from services.run_pipeline import run_info_gathering
from services.preprocess_mentions import preprocess_mentions


parser = argparse.ArgumentParser(description="Company Review Summarizer CLI")
parser.add_argument("company", help="Company name to search for")
parser.add_argument("--limit", type=int, default=10, help="Limit per source")
parser.add_argument("--scrape", action="store_true", help="Run scrapers before processing")

args = parser.parse_args()

if args.scrape:
    run_scraping_for_company(company=args.company, limit=args.limit)
run_info_gathering(company=args.company)

preprocess_mentions(company=args.company)
print(f"✅ Pipeline completed for {args.company}")