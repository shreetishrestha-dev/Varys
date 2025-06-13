import praw
from datetime import datetime
from config import REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET, REDDIT_USER_AGENT
from .base import BaseScraper

class RedditScraper(BaseScraper):
    def __init__(self):
        self.reddit = praw.Reddit(
            client_id=REDDIT_CLIENT_ID,
            client_secret=REDDIT_CLIENT_SECRET,
            user_agent=REDDIT_USER_AGENT
        )

    def scrape(self, company: str, limit: int = 10):
        target_subs = ["technepal", "Nepal", "NepalJobs", "careerguidance", "ITCareerQuestions"]
        review_keywords = ["experience", "review", "working at", "work at", "join", "intern at", "interview at", "salary"]

        results = []

        for sub in target_subs:
            subreddit = self.reddit.subreddit(sub)
            for keyword in review_keywords:
                search_query = f"{company} {keyword}"
                for submission in subreddit.search(search_query, sort="new", limit=limit):
                    post_text = f"{submission.title}\n\n{submission.selftext}"
                    mentions_company = company.lower() in post_text.lower()

                    # Extract relevant comments that mention the company
                    submission.comments.replace_more(limit=0)
                    relevant_comments = [
                        c.body for c in submission.comments.list()
                        if company.lower() in c.body.lower()
                    ]

                    if mentions_company or relevant_comments:
                        results.append({
                            "source": f"r/{sub}",
                            "company": company,
                            "rating": None,
                            "review": post_text.strip(),
                            "comments": relevant_comments,
                            "date": datetime.utcfromtimestamp(submission.created_utc).isoformat(),
                            "role": None,
                            "post_url": f"https://reddit.com{submission.permalink}"
                        })

        return results