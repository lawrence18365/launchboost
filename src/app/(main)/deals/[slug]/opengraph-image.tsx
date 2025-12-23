import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'SaaS Deal - IndieSaasDeals'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image({ params }: { params: { slug: string } }) {
  try {
    // Fetch deal data
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'https://indiesaasdeals.com'}/api/public/deals/${params.slug}`)
    
    if (!response.ok) {
      throw new Error('Deal not found')
    }

    const { deal } = await response.json()

    const formatPrice = (price: number) => {
      const priceInDollars = price > 999 ? price / 100 : price
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(priceInDollars)
    }

    const discountAmount = deal.original_price - deal.deal_price
    const savings = Math.round((discountAmount / deal.original_price) * 100)

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
                fontSize: deal.product_name.length > 30 ? '44px' : '56px',
                fontWeight: 'bold',
                color: 'black',
                textAlign: 'center',
                marginBottom: '24px',
                lineHeight: '1.1',
                maxWidth: '900px',
              }}
            >
              {deal.product_name}
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
              {deal.short_description?.substring(0, 80) + (deal.short_description?.length > 80 ? '...' : '')}
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
                {formatPrice(deal.deal_price)}
              </div>
              <div
                style={{
                  fontSize: '36px',
                  color: '#999',
                  textDecoration: 'line-through',
                }}
              >
                {formatPrice(deal.original_price)}
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
    console.error('Failed to generate OG image for deal:', e?.message)
    
    // Fallback image
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
          }}
        >
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
            }}
          >
            <div
              style={{
                fontSize: '56px',
                fontWeight: 'bold',
                color: 'black',
                textAlign: 'center',
                marginBottom: '24px',
              }}
            >
              SaaS Deal
            </div>
            <div
              style={{
                fontSize: '32px',
                color: '#666',
                textAlign: 'center',
              }}
            >
              IndieSaasDeals - Exclusive SaaS Discounts
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  }
}