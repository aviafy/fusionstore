/**
 * API product/NFT images are often stored as `/images/...` (served by the backend).
 * With Vite dev/preview proxy, relative URLs work. With a full `VITE_API_BASE_URL`,
 * API calls hit the backend host but `<img src="/images/...">` would still target the
 * frontend origin — prepend the backend origin for root-relative asset paths.
 */
export function getBackendPublicOrigin(): string {
  const raw = import.meta.env.VITE_API_BASE_URL?.trim();
  if (!raw || !/^https?:\/\//i.test(raw)) return '';
  try {
    const u = new URL(raw);
    return u.origin;
  } catch {
    return '';
  }
}

export function resolvePublicAssetUrl(path: string | undefined): string {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  const origin = getBackendPublicOrigin();
  if (origin && path.startsWith('/')) return `${origin}${path}`;
  return path;
}
