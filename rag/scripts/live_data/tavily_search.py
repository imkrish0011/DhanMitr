import os

from dotenv import load_dotenv
from tavily import TavilyClient


load_dotenv()


def search_web(
    query: str,
    max_results: int = 5,
    search_depth: str = "basic",
) -> list[dict]:
    """
    Search the web using Tavily.

    Returns a list of search results containing:
    - title
    - url
    - content
    """

    api_key = os.getenv("TAVILY_API_KEY")

    if not api_key:
        raise RuntimeError("TAVILY_API_KEY is not set in .env")

    client = TavilyClient(api_key=api_key)

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
        print(result.get("title"))
        print(result.get("url"))
        print()