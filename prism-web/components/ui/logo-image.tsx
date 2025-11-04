'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Building2 } from 'lucide-react';
import { extractDomain } from '@/lib/logo-service';

interface LogoImageProps {
  name: string;
  website?: string;
  size?: number;
  className?: string;
  fallbackIcon?: boolean;
}

/**
 * Logo Image Component
 * Automatically fetches and displays company/software logos with fallback
 */
export function LogoImage({
  name,
  website,
  size = 48,
  className = '',
  fallbackIcon = true
}: LogoImageProps) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const domain = website ? extractDomain(website) : extractDomain(name);

    if (domain) {
      // Try Clearbit first
      const clearbitUrl = `https://logo.clearbit.com/${domain}`;
      setLogoUrl(clearbitUrl);
    } else {
      // Use placeholder if no domain
      const initials = name
        .split(/\s+/)
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
      setLogoUrl(`https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&size=${size * 2}&background=4F46E5&color=fff&bold=true`);
    }

    setLoading(false);
  }, [name, website, size]);

  const handleError = () => {
    setError(true);
    // Fallback to Google Favicon
    const domain = website ? extractDomain(website) : extractDomain(name);
    if (domain && logoUrl?.includes('clearbit')) {
      setLogoUrl(`https://www.google.com/s2/favicons?domain=${domain}&sz=${size * 2}`);
    } else {
      // Final fallback to placeholder
      const initials = name
        .split(/\s+/)
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
      setLogoUrl(`https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&size=${size * 2}&background=4F46E5&color=fff&bold=true`);
    }
  };

  if (loading) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-200 rounded ${className}`}
        style={{ width: size, height: size }}
      >
        <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!logoUrl && fallbackIcon) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 rounded ${className}`}
        style={{ width: size, height: size }}
      >
        <Building2 className="w-6 h-6 text-gray-400" />
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden rounded bg-white ${className}`}
      style={{ width: size, height: size }}
    >
      {logoUrl && (
        <Image
          src={logoUrl}
          alt={`${name} logo`}
          width={size}
          height={size}
          className="object-contain"
          onError={handleError}
          unoptimized // External URLs need unoptimized
        />
      )}
    </div>
  );
}
