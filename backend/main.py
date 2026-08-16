"""Backend server entry point."""
import sys
from pathlib import Path
import uvicorn

# Add project root to sys.path
ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from backend.app.core.config import settings

def start():
    print(f"🚀 Starting DhanMITR Backend on http://{settings.HOST}:{settings.PORT}")
    uvicorn.run(
        "backend.app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
    )

if __name__ == "__main__":
    start()
