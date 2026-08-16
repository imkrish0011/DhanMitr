# Government-scheme collection and cleaning

Run these commands from the repository root (`DhanMitr`). Both scripts use only
`requests` and Beautiful Soup, preserve source text, and do not use an LLM.

## Collect raw source content

```powershell
python rag/scripts/collect/collect_scheme.py `
  --scheme-name "Pradhan Mantri Jeevan Jyoti Bima Yojana (PMJJBY)" `
  --url "https://financialservices.gov.in/pmjjby" `
  --source-name "Department of Financial Services, Ministry of Finance, Government of India" `
  --output rag/data/periodic/government_schemes/raw/pmjjby_new_raw.json
```

`--source-name` is optional; when it is not supplied, the source URL host is
stored instead. Use the canonical HTTPS URL of the official page. The script
keeps TLS certificate verification enabled and reports HTTP/network failures.

## Clean a raw record

```powershell
python rag/scripts/cleaning/clean_scheme.py `
  rag/data/periodic/government_schemes/raw/pmjjby_new_raw.json `
  rag/data/periodic/government_schemes/cleaned/pmjjby_new_cleaned.json
```

The cleaner reads the raw file without modifying it. It normalizes whitespace,
removes only isolated replacement-character formatting artifacts, drops empty
sections, preserves the source metadata and factual wording, and adds
`"data_type": "periodic"`.
