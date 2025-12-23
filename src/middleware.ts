import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Note: 'crypto' from Node.js is not imported.
// The Web Crypto API is available globally in the Edge Runtime.

export function middleware(request: NextRequest) {
  // WWW redirect - redirect www to non-www
  const url = request.nextUrl.clone()
  if (url.hostname.startsWith('www.')) {
    url.hostname = url.hostname.replace(/^www\./, '')
    return NextResponse.redirect(url, 301)
  }

  // Check request size limits
  const contentLength = request.headers.get('content-length')
  if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) { // 10MB limit
    return new NextResponse('Request too large', { status: 413 })
  }

  // Create response object to modify headers
  const response = NextResponse.next()

  // --- Security Headers ---
  response.headers.set('X-DNS-Prefetch-Control', 'on')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  // Keep referrer policy aligned with next.config headers
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  // A robust Content-Security-Policy is highly specific to your application's needs.
  // The policy below is a good starting point.
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      // JS
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' *.stripe.com *.google.com *.googleapis.com *.googletagmanager.com *.facebook.net connect.facebook.net",
      // CSS
      "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
      // Fonts
      "font-src 'self' fonts.gstatic.com",
      // Images (add GA and avatar domains)
      "img-src 'self' data: blob: *.supabase.co *.googleapis.com *.googleusercontent.com images.unsplash.com *.cloudflarestorage.com *.r2.dev *.facebook.com www.google-analytics.com avatars.githubusercontent.com lh3.googleusercontent.com",
      // XHR/WebSockets/etc: allow required services + any HTTPS (for outbound deal links/pixels during nav)
      "connect-src 'self' *.supabase.co *.stripe.com *.google.com *.facebook.com *.facebook.net *.googletagmanager.com www.google-analytics.com https:"
    ].join('; ')
  )

  // --- CSRF Protection for API Routes ---
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
    // Skip CSRF for webhooks, which are verified separately
    if (request.nextUrl.pathname.startsWith('/api/webhooks/')) {
        // Continue to the next middleware or the route handler
    } else if (request.nextUrl.pathname.startsWith('/api/')) {
      const origin = request.headers.get('origin')
      const host = request.headers.get('host')
      const referer = request.headers.get('referer')
      
      const allowedOrigins = new Set([
        `https://${host}`,
        `http://${host}` // For local development
      ]);

      if (process.env.NODE_ENV === 'production') {
        allowedOrigins.add('https://indiesaasdeals.com');
      } else {
        allowedOrigins.add('http://localhost:3000');
      }
      
      const isValidOrigin = origin && allowedOrigins.has(origin)
      const isValidReferer = referer && Array.from(allowedOrigins).some(allowed => referer.startsWith(allowed))
      
      if (!isValidOrigin && !isValidReferer) {
        return new NextResponse('CSRF validation failed: Invalid origin.', { status: 403 })
      }
    }
  }

  // --- Set CSRF Token Cookie for Client-Side ---
  // This runs for pages, not for API routes, to provide the token to the frontend.
  if (!request.cookies.has('csrf-token') && !request.nextUrl.pathname.startsWith('/api/')) {
    // Use Web Crypto API for random values (Edge compatible)
    const randomValues = crypto.getRandomValues(new Uint8Array(32));
    const csrfToken = Array.from(randomValues).map(b => b.toString(16).padStart(2, '0')).join('');
    
    response.cookies.set({
      name: 'csrf-token',
      value: csrfToken,
      httpOnly: false, // Must be readable by client-side script
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    });
  }
  
  // --- CORS for API routes ---
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const allowedOrigin = process.env.NODE_ENV === 'production' ? 'https://indiesaasdeals.com' : '*'
    response.headers.set('Access-Control-Allow-Origin', allowedOrigin)
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token')
  }

  // NOTE: In-memory rate limiting using `global` is not supported in the Edge.
  // For production applications, use a distributed solution like Upstash Redis.
  // Example: https://vercel.com/guides/rate-limiting-nextjs-edge-upstash

  return response
}

// --- Matcher Configuration ---
// Apply middleware to all routes except for static assets and special files.
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
}
