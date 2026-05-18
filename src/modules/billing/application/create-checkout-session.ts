import { cookies } from 'next/headers'
import { createSupabaseServerClient } from '@/shared/infra/supabase/server'
import { stripe } from '../infra/stripe-client'

export async function createCheckoutSession(): Promise<
  { url: string } | { error: string; status: number }
> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated', status: 401 }

  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single()

  let customerId = profile?.stripe_customer_id as string | null

  if (customerId) {
    try {
      await stripe.customers.retrieve(customerId)
    } catch {
      customerId = null
      await supabase.from('profiles').update({ stripe_customer_id: null }).eq('id', user.id)
    }
  }

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { supabase_user_id: user.id },
    })
    customerId = customer.id

    await supabase
      .from('profiles')
      .update({ stripe_customer_id: customerId })
      .eq('id', user.id)
  }

  const cookieStore = await cookies()
  const isEn = cookieStore.get('NEXT_LOCALE')?.value === 'en'
  const base = process.env.NEXT_PUBLIC_APP_URL
  const successUrl = isEn ? `${base}/en/welcome` : `${base}/bienvenida`
  const cancelUrl = isEn
    ? `${base}/en/training?canceled=true`
    : `${base}/entrenamiento?canceled=true`

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
    locale: isEn ? 'en' : 'es',
    success_url: successUrl,
    cancel_url: cancelUrl,
  })

  return { url: session.url! }
}
