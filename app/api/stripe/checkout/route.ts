import { NextResponse } from 'next/server'
import { createCheckoutSession } from '@/modules/billing/application/create-checkout-session'

export async function POST() {
  try {
    const result = await createCheckoutSession()
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status })
    }
    return NextResponse.json({ url: result.url })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
