// app/api/newsletter/subscribe/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, message: 'Valid email address is required' },
        { status: 400 }
      );
    }

    // EmailOctopus API configuration
    const EMAILOCTOPUS_API_KEY = process.env.EMAILOCTOPUS_API_KEY;
    const EMAILOCTOPUS_LIST_ID = process.env.EMAILOCTOPUS_LIST_ID;

    if (!EMAILOCTOPUS_API_KEY || !EMAILOCTOPUS_LIST_ID) {
      console.error('EmailOctopus configuration missing');
      return NextResponse.json(
        { success: false, message: 'Newsletter service configuration error' },
        { status: 500 }
      );
    }

    // EmailOctopus API endpoint
    const apiUrl = `https://emailoctopus.com/api/1.6/lists/${EMAILOCTOPUS_LIST_ID}/contacts`;

    // Make request to EmailOctopus
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: EMAILOCTOPUS_API_KEY,
        email_address: email,
        status: 'SUBSCRIBED',
        // Optional: Add tags or custom fields
        tags: ['website-newsletter'],
        // fields: {
        //   FirstName: '', // if you collect first name
        //   LastName: '',  // if you collect last name
        // }
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('EmailOctopus subscription successful:', email);
      return NextResponse.json({
        success: true,
        message: 'Successfully subscribed to our newsletter! 🎉'
      });
    } else {
      // Handle EmailOctopus specific errors
      if (data.error && data.error.code === 'MEMBER_EXISTS_WITH_EMAIL_ADDRESS') {
        return NextResponse.json({
          success: false,
          message: 'You\'re already subscribed to our newsletter!'
        }, { status: 400 });
      }

      if (data.error && data.error.code === 'INVALID_PARAMETERS') {
        return NextResponse.json({
          success: false,
          message: 'Please enter a valid email address'
        }, { status: 400 });
      }

      console.error('EmailOctopus API error:', data);
      return NextResponse.json({
        success: false,
        message: 'Failed to subscribe. Please try again later.'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json({
      success: false,
      message: 'Something went wrong. Please try again later.'
    }, { status: 500 });
  }
}