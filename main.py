import argparse
from scrapers.run_scraping import run_scraping_for_company
from services.run_pipeline import run_info_gathering
from services.preprocess_mentions import preprocess_mentions
from services.populate_mentions_agentically import populate_mentions

parser = argparse.ArgumentParser(description="Company Review Summarizer CLI")
parser.add_argument("company", help="Company name to search for")
parser.add_argument("--limit", type=int, default=10, help="Limit per source")
parser.add_argument("--scrape", action="store_true", default=False, help="Run scrapers before processing")
parser.add_argument("--gather", action="store_true", default=False, help="Gather mentions from scraped data")
parser.add_argument("--preprocess", action="store_true", default=False, help="Run preprocessing on mentions")
parser.add_argument("--populate-agent", action="store_true", default=False, help="Populate DB with enriched mentions via agent")

args = parser.parse_args()

if args.scrape:
    run_scraping_for_company(company=args.company, limit=args.limit)

if args.gather:
    run_info_gathering(company=args.company)

if args.preprocess:
    preprocess_mentions(company=args.company)

if args.populate_agent:
    populate_mentions(company=args.company)

print(f"✅ Pipeline completed for {args.company}")