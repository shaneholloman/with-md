const DEFAULT_SITE_URL = 'https://with.md';

function normalizeSiteUrl(rawUrl: string | undefined): string {
  const candidate = rawUrl?.trim() || DEFAULT_SITE_URL;

  try {
    return new URL(candidate).origin;
  } catch {
    return DEFAULT_SITE_URL;
  }
}

export const siteUrl = normalizeSiteUrl(process.env.NEXT_PUBLIC_APP_URL);

// Keep the sitemap focused on canonical landing pages that should rank.
export const indexableMarketingPaths = ['/'] as const;

export function buildSiteUrl(path: string): string {
  return new URL(path, siteUrl).toString();
}
