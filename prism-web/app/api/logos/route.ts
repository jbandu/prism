/**
 * API Route: Fetch and Cache Logos
 * GET /api/logos?type=company&id=uuid
 * GET /api/logos?type=software&id=uuid
 * GET /api/logos?name=CompanyName&website=example.com (direct fetch without caching)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { fetchLogo } from '@/lib/logo-service';
import { neon } from '@/lib/db';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'company' or 'software'
    const id = searchParams.get('id');
    const name = searchParams.get('name');
    const website = searchParams.get('website') || undefined;

    // Direct fetch without caching (for preview/testing)
    if (name && !id) {
      const result = await fetchLogo(name, website);
      return NextResponse.json({
        success: true,
        data: result
      });
    }

    // Fetch with database caching
    if (!type || !id) {
      return NextResponse.json(
        { error: 'Missing required parameters: type and id' },
        { status: 400 }
      );
    }

    if (type !== 'company' && type !== 'software') {
      return NextResponse.json(
        { error: 'Invalid type. Must be "company" or "software"' },
        { status: 400 }
      );
    }

    // Check if logo is already cached
    const table = type === 'company' ? 'companies' : 'software';
    const cached = await sql`
      SELECT logo_url, logo_source, logo_cached_at
      FROM ${sql(table)}
      WHERE id = ${id}
    `;

    if (cached.length === 0) {
      return NextResponse.json(
        { error: `${type} not found` },
        { status: 404 }
      );
    }

    // If cached and recent (less than 7 days old), return cached
    const cachedData = cached[0];
    const cacheAge = cachedData.logo_cached_at
      ? Date.now() - new Date(cachedData.logo_cached_at).getTime()
      : Infinity;
    const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

    if (cachedData.logo_url && cacheAge < CACHE_TTL) {
      return NextResponse.json({
        success: true,
        data: {
          url: cachedData.logo_url,
          source: cachedData.logo_source,
          cached: true,
          cachedAt: cachedData.logo_cached_at
        }
      });
    }

    // Need to fetch fresh logo
    // Get entity name and website
    const entity = await sql`
      SELECT
        ${sql(type === 'company' ? 'company_name' : 'software_name')} as name,
        ${sql(type === 'company' ? 'NULL' : 'vendor_name')} as vendor
      FROM ${sql(table)}
      WHERE id = ${id}
    `;

    if (entity.length === 0) {
      return NextResponse.json(
        { error: `${type} not found` },
        { status: 404 }
      );
    }

    const entityName = entity[0].name;
    const vendorName = entity[0].vendor;

    // Fetch logo from external APIs
    const result = await fetchLogo(entityName, website);

    // Cache in database
    await sql`
      UPDATE ${sql(table)}
      SET
        logo_url = ${result.url},
        logo_source = ${result.source},
        logo_cached_at = NOW()
      WHERE id = ${id}
    `;

    return NextResponse.json({
      success: true,
      data: {
        ...result,
        cached: false
      }
    });

  } catch (error) {
    console.error('Error fetching logo:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch logo'
      },
      { status: 500 }
    );
  }
}
