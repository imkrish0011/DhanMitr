import json
import sys
from pathlib import Path


MAX_CHUNK_CHARS = 2000


def load_data(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def split_text(text):
    words = text.split()
    chunks = []
    current = ""

    for word in words:
        if len(current) + len(word) + 1 > MAX_CHUNK_CHARS:
            if current:
                chunks.append(current.strip())
            current = word
        else:
            current += " " + word

    if current:
        chunks.append(current.strip())

    return chunks


def create_chunks(data):
    chunks = []

    for section in data["sections"]:
        heading = section["heading"]
        content = section["content"]

        text_chunks = split_text(content)

        for i, text in enumerate(text_chunks, start=1):
            chunks.append({
                "chunk_id": f"{data['scheme_name']}-{len(chunks) + 1:03d}",
                "section": heading,
                "source_document": data["scheme_name"],
                "source_name": data["source_name"],
                "source_url": data["source_url"],
                "retrieved_at": data["retrieved_at"],
                "data_type": data["data_type"],
                "text": text
            })

    return chunks


def main():
    if len(sys.argv) != 3:
        print("Usage: python chunk_generic.py input.json output.json")
        return 1

    input_path = Path(sys.argv[1])
    output_path = Path(sys.argv[2])

    data = load_data(input_path)
    chunks = create_chunks(data)

    output = {
        "source_document": data["scheme_name"],
        "source_name": data["source_name"],
        "source_url": data["source_url"],
        "retrieved_at": data["retrieved_at"],
        "data_type": data["data_type"],
        "chunks": chunks
    }

    output_path.parent.mkdir(parents=True, exist_ok=True)

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print("Created chunks:", len(chunks))
    print("Saved to:", output_path)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())