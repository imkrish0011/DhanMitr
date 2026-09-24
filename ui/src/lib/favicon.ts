/** Resolve a website URL to its favicon via Google's secure favicon service to avoid CORS/CORP issues. */
export function getFaviconUrl(value: string) {
  try {
    const url = new URL(value.startsWith('http') ? value : `https://${value}`);
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(url.hostname)}&sz=32`;
  } catch {
    return null;
  }
}
