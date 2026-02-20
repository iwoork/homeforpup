import { NextRequest, NextResponse } from 'next/server';
import { DOG_COLORS, DogColor, DogColorCategory } from '@homeforpup/shared-types';

import { auth } from '@clerk/nextjs/server';
export const dynamic = 'force-dynamic';

interface DogColorsResponse {
  colors: DogColor[];
  total: number;
  categories: {
    solid: number;
    pattern: number;
    'multi-color': number;
  };
}

/**
 * GET /api/dog-colors
 * Retrieves list of dog colors with optional filtering
 * 
 * Query parameters:
 * - category: Filter by category (solid, pattern, multi-color)
 * - search: Search colors by name or description
 * - limit: Limit number of results
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') as DogColorCategory | null;
    const search = searchParams.get('search')?.toLowerCase();
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;

    let filteredColors = [...DOG_COLORS];

    // Filter by category
    if (category && ['solid', 'pattern', 'multi-color'].includes(category)) {
      filteredColors = filteredColors.filter(color => color.category === category);
    }

    // Search filter
    if (search) {
      filteredColors = filteredColors.filter(color => 
        color.name.toLowerCase().includes(search) ||
        color.description?.toLowerCase().includes(search) ||
        color.category.toLowerCase().includes(search)
      );
    }

    // Apply limit
    if (limit && limit > 0) {
      filteredColors = filteredColors.slice(0, limit);
    }

    // Calculate category counts
    const categories = {
      solid: DOG_COLORS.filter(c => c.category === 'solid').length,
      pattern: DOG_COLORS.filter(c => c.category === 'pattern').length,
      'multi-color': DOG_COLORS.filter(c => c.category === 'multi-color').length,
    };

    const response: DogColorsResponse = {
      colors: filteredColors,
      total: filteredColors.length,
      categories
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Error fetching dog colors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dog colors', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

