import os
from dotenv import load_dotenv
from tavily import TavilyClient

load_dotenv()

api_key = os.getenv("TAVILY_API_KEY")

if not api_key:
    raise RuntimeError("TAVILY_API_KEY not found in .env")

client = TavilyClient(api_key=api_key)

response = client.search(
    query="latest government scholarships for B.Tech students in India",
    search_depth="basic",
    max_results=5,
)

for result in response.get("results", []):
    print(result.get("title", "").encode("ascii", "replace").decode("ascii"))
    print(result.get("url", ""))
    print()
