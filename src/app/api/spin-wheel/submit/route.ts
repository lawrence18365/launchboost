import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/server/db';

export async function POST(request: NextRequest) {
  try {
    const { email, prize } = await request.json();
    
    if (!email || !prize) {
      return NextResponse.json({ error: 'Email and prize are required' }, { status: 400 });
    }

    const supabase = createServiceRoleClient();
    
    // Get client IP address
    const forwarded = request.headers.get("x-forwarded-for");
    const realIP = request.headers.get("x-real-ip");
    const clientIP = forwarded 
      ? forwarded.split(',')[0].trim() 
      : realIP || request.ip || 'unknown';

    // Get user agent for additional fingerprinting
    const userAgent = request.headers.get("user-agent") || '';
    
    // Create a simple fingerprint combining IP and browser info
    const fingerprint = `${clientIP}-${Buffer.from(userAgent).toString('base64').slice(0, 20)}`;

    // Check if this fingerprint has already spun
    const { data: existingSpin, error: checkError } = await supabase
      .from('spin_wheel_attempts')
      .select('id')
      .eq('fingerprint', fingerprint)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Database error checking existing spin:', checkError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    if (existingSpin) {
      return NextResponse.json({ 
        error: 'You have already spun the wheel from this device/location' 
      }, { status: 400 });
    }

    // Record the spin attempt
    const { error: insertError } = await supabase
      .from('spin_wheel_attempts')
      .insert({
        fingerprint,
        ip_address: clientIP,
        user_agent: userAgent,
        email,
        prize,
        created_at: new Date().toISOString()
      });

    if (insertError) {
      console.error('Error recording spin attempt:', insertError);
      return NextResponse.json({ error: 'Failed to record spin' }, { status: 500 });
    }

    // Also subscribe to newsletter (existing functionality)
    try {
      const newsletterResponse = await fetch(new URL('/api/newsletter/subscribe', request.url), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email,
          source: 'spin_wheel',
          prize 
        }),
      });

      if (!newsletterResponse.ok) {
        console.warn('Newsletter subscription failed, but spin recorded');
      }
    } catch (newsletterError) {
      console.warn('Newsletter subscription error:', newsletterError);
    }

    return NextResponse.json({ 
      success: true,
      message: 'Spin recorded successfully' 
    });

  } catch (error) {
    console.error('Error processing spin wheel submission:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}