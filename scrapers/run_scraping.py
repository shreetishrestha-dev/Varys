from scrapers.reddit_scraper import RedditScraper

from utils.io import save_json

def run_scraping_for_company(company: str, limit: int = 10):
    print(f"🔍 Running scrapers for: {company}")

    # # Run Reddit scraper
    print("Starting Reddit scraping...")
    reddit_scraper = RedditScraper()
    reddit_results = reddit_scraper.scrape(company=company, limit=limit)
    save_json(reddit_results, f"reddit_{company}.json")
    print(f"✅ Reddit scraping completed for {company}")

    print(f"✅ Scraping completed for {company}")