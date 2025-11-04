/**
 * Logo Service
 * Fetches company/software logos from external APIs with fallback chain
 *
 * API Priority:
 * 1. Famous brands mapping (instant, pre-configured)
 * 2. Clearbit Logo API (high quality, free tier)
 * 3. Google Favicon API (fallback)
 * 4. Default placeholder
 */

import { findBrandLogo } from './brand-logos';

export interface LogoResult {
  url: string;
  source: 'famous' | 'clearbit' | 'google' | 'placeholder';
  cachedAt?: Date;
}

/**
 * Extract domain from company/software name or URL
 */
export function extractDomain(input: string): string | null {
  try {
    // If it looks like a URL, parse it
    if (input.includes('http://') || input.includes('https://')) {
      const url = new URL(input);
      return url.hostname.replace('www.', '');
    }

    // If it's an email domain
    if (input.includes('@')) {
      return input.split('@')[1];
    }

    // Otherwise, try to construct a domain from company name
    // Common patterns: "BioRad" -> "biorad.com", "monday.com" -> "monday.com"
    const cleaned = input.toLowerCase().trim();

    // Already looks like a domain
    if (cleaned.includes('.com') || cleaned.includes('.io') || cleaned.includes('.net')) {
      return cleaned.replace('www.', '');
    }

    // Remove common suffixes
    const withoutSuffixes = cleaned
      .replace(/\s+(inc|llc|ltd|corp|corporation|limited|labs|laboratories)\.?$/i, '')
      .trim();

    // Convert to domain format
    const domain = withoutSuffixes
      .replace(/[^a-z0-9]+/g, '')
      .replace(/^-+|-+$/g, '');

    return domain ? `${domain}.com` : null;
  } catch {
    return null;
  }
}

/**
 * Fetch logo from Clearbit API
 */
async function fetchFromClearbit(domain: string): Promise<string | null> {
  try {
    const url = `https://logo.clearbit.com/${domain}`;

    // Just return the URL - Clearbit returns 200 for valid logos, 404 for missing
    // We'll validate on the client side with img onError
    const response = await fetch(url, {
      method: 'HEAD',
      signal: AbortSignal.timeout(3000) // 3 second timeout
    });

    if (response.ok) {
      return url;
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Fetch favicon from Google's service
 */
function getFaviconUrl(domain: string): string {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
}

/**
 * Get placeholder logo URL
 */
function getPlaceholderUrl(name: string): string {
  // Use UI Avatars as placeholder with company initials
  const initials = name
    .split(/\s+/)
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&size=128&background=4F46E5&color=fff&bold=true`;
}

/**
 * Fetch logo with fallback chain
 * Returns the best available logo URL
 */
export async function fetchLogo(companyName: string, websiteUrl?: string): Promise<LogoResult> {
  // 1. Check famous brands first (instant, no API calls)
  const famousBrand = findBrandLogo(companyName);
  if (famousBrand) {
    return {
      url: famousBrand.logoUrl,
      source: 'famous'
    };
  }

  // 2. Try to extract domain from website URL first, then company name
  const domain = websiteUrl ? extractDomain(websiteUrl) : extractDomain(companyName);

  if (!domain) {
    return {
      url: getPlaceholderUrl(companyName),
      source: 'placeholder'
    };
  }

  // 3. Try Clearbit (best quality for non-famous brands)
  const clearbitUrl = await fetchFromClearbit(domain);
  if (clearbitUrl) {
    return {
      url: clearbitUrl,
      source: 'clearbit'
    };
  }

  // 4. Fallback to Google Favicon
  return {
    url: getFaviconUrl(domain),
    source: 'google'
  };
}

/**
 * Batch fetch logos for multiple companies/software
 */
export async function fetchLogoBatch(
  items: Array<{ name: string; website?: string }>
): Promise<Map<string, LogoResult>> {
  const results = new Map<string, LogoResult>();

  // Fetch in parallel with rate limiting
  const promises = items.map(async (item) => {
    const result = await fetchLogo(item.name, item.website);
    results.set(item.name, result);
  });

  await Promise.all(promises);

  return results;
}
