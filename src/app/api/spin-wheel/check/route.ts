import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/server/db';

export async function GET(request: NextRequest) {
  try {
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

    // Check if this fingerprint has already spun the wheel
    const { data: existingSpin, error } = await supabase
      .from('spin_wheel_attempts')
      .select('id, created_at, email, prize')
      .eq('fingerprint', fingerprint)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Database error checking spin attempts:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    return NextResponse.json({
      canSpin: !existingSpin,
      hasSpun: !!existingSpin,
      fingerprint: fingerprint.slice(0, 10) + '...', // Partial for debugging
      lastSpin: existingSpin ? {
        date: existingSpin.created_at,
        email: existingSpin.email,
        prize: existingSpin.prize
      } : null
    });

  } catch (error) {
    console.error('Error checking spin wheel eligibility:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}