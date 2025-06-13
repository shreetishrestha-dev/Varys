from abc import ABC, abstractmethod

class BaseScraper(ABC):
    """
    Abstract base class for web scrapers.
    All scrapers should inherit from this class and implement the `scrape` method.
    """

    @abstractmethod
    def scrape(self, query: str, limit: int = 10):
        """
        Scrape data from a website.

        :param args: Positional arguments for the scrape method.
        :param kwargs: Keyword arguments for the scrape method.
        :return: Scraped data.
        """
        pass