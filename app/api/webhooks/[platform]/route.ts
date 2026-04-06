import { bot } from '@/lib/bot'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Get the WhatsApp handler
    const handler = bot.webhooks.whatsapp
    if (!handler) {
      return NextResponse.json({ error: 'WhatsApp handler not found' }, { status: 404 })
    }

    // Process the webhook through Chat SDK
    // Important: Pass request directly to handler without reading body first
    // The Chat SDK needs to read the raw request body itself
    const response = await handler(request)

    return response
  } catch (error) {
    console.error('[v0] Webhook error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  // WhatsApp webhook verification endpoint
  const searchParams = request.nextUrl.searchParams
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN

  console.log('[v0] Webhook verification requested')
  console.log('[v0] Mode:', mode)
  console.log('[v0] Token match:', token === verifyToken)

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('[v0] Webhook verified successfully')
    return new NextResponse(challenge, { status: 200 })
  }

  console.log('[v0] Webhook verification failed')
  return NextResponse.json({ error: 'Verification failed' }, { status: 403 })
}
