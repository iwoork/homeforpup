import { NextRequest, NextResponse } from 'next/server';
import { puppiesApiClient, PuppyFilters } from '@homeforpup/shared-dogs';

import { auth } from '@clerk/nextjs/server';
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const filters: PuppyFilters = {
      country: searchParams.get('country') || undefined,
      state: searchParams.get('state') || undefined,
      breed: searchParams.get('breed') || undefined,
      gender: (searchParams.get('gender') as 'male' | 'female') || undefined,
      shipping: searchParams.get('shipping') === 'true',
      verified: searchParams.get('verified') === 'true',
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 12,
    };

    console.log('Available puppies API called with filters:', filters);

    const result = await puppiesApiClient.getAvailablePuppies(filters);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching available puppies:', error);
    return NextResponse.json(
      { 
        message: 'Error fetching available puppies',
        error: process.env.NODE_ENV === 'development' ? String(error) : 'Internal server error'
      },
      { status: 500 }
    );
  }
}
