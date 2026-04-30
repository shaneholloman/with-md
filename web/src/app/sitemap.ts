import type { MetadataRoute } from 'next';

import { buildSiteUrl, indexableMarketingPaths } from '@/lib/with-md/site';

export default function sitemap(): MetadataRoute.Sitemap {
  return indexableMarketingPaths.map((path) => ({
    url: buildSiteUrl(path),
    changeFrequency: 'weekly',
    priority: path === '/' ? 1 : 0.8,
  }));
}
