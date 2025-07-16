import argparse
from scrapers.run_scraping import run_scraping_for_company
from services.run_pipeline import run_info_gathering
from services.preprocess_mentions import preprocess_mentions
from services.populate_mentions_agentically import populate_mentions
from services.rag.retriever import get_company_retriever
from services.embed_mentions_from_db import build_vectorstore_from_db
from services.db_setup import setup_tables

setup_tables()

parser = argparse.ArgumentParser(description="Company Review Summarizer CLI")
parser.add_argument("company", help="Company name to search for")
parser.add_argument("--limit", type=int, default=10, help="Limit per source")
parser.add_argument("--scrape", action="store_true", default=False, help="Run scrapers before processing")
parser.add_argument("--gather", action="store_true", default=False, help="Gather mentions from scraped data")
parser.add_argument("--preprocess", action="store_true", default=False, help="Run preprocessing on mentions")
parser.add_argument("--populate-agent", action="store_true", default=False, help="Populate DB with enriched mentions via agent")
parser.add_argument("--embed", action="store_true", default=False, help="Build vector store from DB")
parser.add_argument("--rag-retriever", action="store_true", default=False, help="Run RAG retriever for the company")

parser.add_argument("--all", action="store_true", help="Run all pipeline stages (scrape → gather → preprocess → populate → embed)")

args = parser.parse_args()

run_all = args.all

if args.scrape or run_all:
    run_scraping_for_company(company=args.company, limit=args.limit)

if args.gather or run_all:
    run_info_gathering(company=args.company)

if args.preprocess or run_all:
    preprocess_mentions(company=args.company)

if args.populate_agent or run_all:
    populate_mentions(company=args.company)

if args.embed or run_all:
    build_vectorstore_from_db(company=args.company)

if args.rag_retriever:
    retriever = get_company_retriever(args.company)
    print("✅ Retriever ready for use")

print(f"✅ Pipeline completed for {args.company}")