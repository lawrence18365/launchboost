import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const productName = searchParams.get('name') || 'SaaS Deal'
    const description = searchParams.get('description') || 'Exclusive discount available'
    const price = searchParams.get('price') || '$0'
    const originalPrice = searchParams.get('originalPrice') || '$0'
    const savings = searchParams.get('savings') || '0'

    return new ImageResponse(
      (
        <div
          style={{
            background: '#FFFD63',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'Geist, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
            position: 'relative',
          }}
        >
          {/* Main content */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'white',
              border: '4px solid black',
              borderRadius: '24px',
              width: '1040px',
              height: '550px',
              padding: '60px',
              position: 'relative',
            }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                marginBottom: '40px',
              }}
            >
              <div
                style={{
                  backgroundColor: 'black',
                  color: '#FFFD63',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  fontSize: '36px',
                  fontWeight: 'bold',
                }}
              >
                {savings}% OFF
              </div>
              <div
                style={{
                  fontSize: '28px',
                  fontWeight: 'bold',
                  color: 'black',
                }}
              >
                IndieSaasDeals
              </div>
            </div>

            {/* Product name */}
            <div
              style={{
                fontSize: '56px',
                fontWeight: 'bold',
                color: 'black',
                textAlign: 'center',
                marginBottom: '24px',
                lineHeight: '1.1',
                maxWidth: '900px',
              }}
            >
              {productName}
            </div>

            {/* Description */}
            <div
              style={{
                fontSize: '32px',
                color: '#666',
                textAlign: 'center',
                marginBottom: '40px',
                maxWidth: '800px',
                lineHeight: '1.2',
              }}
            >
              {description}
            </div>

            {/* Pricing */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '24px',
              }}
            >
              <div
                style={{
                  fontSize: '48px',
                  fontWeight: 'bold',
                  color: 'black',
                }}
              >
                {price}
              </div>
              <div
                style={{
                  fontSize: '36px',
                  color: '#999',
                  textDecoration: 'line-through',
                }}
              >
                {originalPrice}
              </div>
            </div>
          </div>

          {/* Corner badge */}
          <div
            style={{
              position: 'absolute',
              top: '40px',
              right: '40px',
              backgroundColor: 'red',
              color: 'white',
              padding: '16px 24px',
              borderRadius: '12px',
              fontSize: '24px',
              fontWeight: 'bold',
              transform: 'rotate(12deg)',
            }}
          >
            LIMITED TIME
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (e: any) {
    console.error('Failed to generate OG image:', e?.message)
    return new Response('Failed to generate image', { status: 500 })
  }
}