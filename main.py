"""DhanMITR Monorepo Management CLI and Structure Verifier.

Usage:
    python main.py check    # Verify directory structure and teammate folders
    python main.py backend  # Launch the FastAPI backend server
    python main.py info     # Display system architecture and team ownership map
"""

import sys
from pathlib import Path

# Ensure UTF-8 output where supported
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

ROOT_DIR = Path(__file__).resolve().parent


def check_structure() -> bool:
    """Verifies that all required monorepo folders and files exist cleanly."""
    print("=" * 60)
    print("[CHECK] Verifying DhanMITR Monorepo Structure...")
    print("=" * 60)

    required_paths = [
        ("ui/package.json", "UI Next.js Configuration"),
        ("ui/src/app/page.tsx", "UI Landing Page"),
        ("voice/.gitkeep", "Voice Module Placeholder"),
        ("rag/.gitkeep", "RAG Module Placeholder"),
        ("backend/app/main.py", "Backend FastAPI App"),
        ("backend/requirements.txt", "Backend Requirements"),
        ("shared/schemas/chat_request.json", "Shared Chat Request Schema"),
        ("shared/types/typescript/index.ts", "Shared TypeScript Types"),
        ("shared/types/python/models.py", "Shared Python Types"),
        ("docs/architecture.md", "Architecture Documentation"),
        ("docs/development.md", "Development Documentation"),
        ("docs/integration.md", "Integration Documentation"),
        (".gitignore", "Root Git Ignore"),
        (".env.example", "Root Environment Template"),
        ("README.md", "Repository README"),
    ]

    all_valid = True
    for rel_path, desc in required_paths:
        target = ROOT_DIR / rel_path
        if target.exists():
            print(f"  [OK]   {rel_path:<35} - {desc}")
        else:
            print(f"  [FAIL] {rel_path:<35} - MISSING ({desc})")
            all_valid = False

    # Ensure voice and rag only contain .gitkeep
    for empty_folder in ["voice", "rag"]:
        folder_path = ROOT_DIR / empty_folder
        if folder_path.exists():
            files = [f.name for f in folder_path.iterdir() if f.is_file() or f.is_dir()]
            if files == [".gitkeep"]:
                print(f"  [OK]   {empty_folder}/ contains ONLY .gitkeep (Ready for teammate)")
            else:
                print(f"  [FAIL] {empty_folder}/ should only contain .gitkeep, found: {files}")
                all_valid = False

    print("=" * 60)
    if all_valid:
        print("[SUCCESS] All checks passed! Monorepo is clean and team-ready.")
    else:
        print("[WARNING] Some files are missing or extra files were detected.")
    print("=" * 60)
    return all_valid


def print_info():
    """Prints monorepo architecture and team ownership."""
    print("""
======================================================================
  DhanMITR - AI Personal Finance Assistant Monorepo
======================================================================

MODULE OWNERSHIP:
  ui/       -> Frontend (Next.js, TypeScript, Tailwind, Recharts, shadcn)
  voice/    -> STT / TTS & Voice Pipeline (Owned by Voice Teammate)
  rag/      -> RAG / LLM & Financial Intelligence (Owned by RAG Teammate)
  backend/  -> FastAPI API & Integration Orchestrator
  shared/   -> Canonical Contracts, JSON Schemas, Types, Constants
  docs/     -> System Architecture, Dev Guides, Integration Docs

DEVELOPMENT COMMANDS:
  UI:       cd ui && npm install && npm run dev (http://localhost:3000)
  Backend:  uvicorn backend.app.main:app --reload --port 8000
  Check:    python main.py check
======================================================================
""")


def start_backend():
    """Starts the FastAPI backend application."""
    import uvicorn
    from backend.app.core.config import settings

    print(f"Starting DhanMITR Backend on http://{settings.HOST}:{settings.PORT}")
    uvicorn.run("backend.app.main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)


def main():
    if len(sys.argv) < 2:
        print_info()
        check_structure()
        return

    cmd = sys.argv[1].lower()
    if cmd == "check":
        success = check_structure()
        sys.exit(0 if success else 1)
    elif cmd == "backend":
        start_backend()
    elif cmd == "info":
        print_info()
    else:
        print(f"Unknown command: {cmd}")
        print("Available commands: check, backend, info")
        sys.exit(1)


if __name__ == "__main__":
    main()
