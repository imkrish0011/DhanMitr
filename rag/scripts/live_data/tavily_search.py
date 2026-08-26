import os
from pathlib import Path
from typing import List, Dict, Any

from dotenv import load_dotenv

ROOT_DIR = Path(__file__).resolve().parents[3]
load_dotenv(ROOT_DIR / ".env")
load_dotenv()

try:
    from tavily import TavilyClient
except ImportError:
    TavilyClient = None


_client = None


def _get_tavily_client():
    global _client
    if _client is None:
        if TavilyClient is None:
            raise RuntimeError(
                "tavily-python is not installed. Run `pip install tavily-python`."
            )
        api_key = os.getenv("TAVILY_API_KEY")
        if not api_key:
            raise RuntimeError("TAVILY_API_KEY is not set in .env")
        _client = TavilyClient(api_key=api_key)
    return _client


def search_web(
    query: str,
    max_results: int = 5,
    search_depth: str = "basic",
) -> List[Dict[str, Any]]:
    """
    Search the web using Tavily.

    Returns a list of search results containing:
    - title
    - url
    - content
    """
    client = _get_tavily_client()

    response = client.search(
        query=query,
        search_depth=search_depth,
        max_results=max_results,
    )

    return response.get("results", [])


def build_web_context(results: list[dict]) -> str:
    """
    Convert Tavily search results into context that can be
    passed to the LLM.
    """

    if not results:
        return ""

    context_parts = []

    for i, result in enumerate(results, 1):
        title = result.get("title", "Untitled")
        url = result.get("url", "")
        content = result.get("content", "")

        context_parts.append(
            f"--- WEB SOURCE {i} ---\n"
            f"Title: {title}\n"
            f"URL: {url}\n"
            f"Content: {content}\n"
        )

    return "\n".join(context_parts)


if __name__ == "__main__":
    query = "latest government scholarships for B.Tech students in India"

    results = search_web(query)

    print(f"Found {len(results)} results.\n")

    for result in results:
        print(result.get("title", "").encode("ascii", "replace").decode("ascii"))
        print(result.get("url"))
        print()