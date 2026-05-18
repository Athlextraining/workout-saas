import { cookies } from 'next/headers'
import { createSupabaseServerClient } from '@/shared/infra/supabase/server'
import { stripe } from '../infra/stripe-client'

export async function createPortalSession(): Promise<
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

  if (!profile?.stripe_customer_id) {
    return { error: 'No subscription found', status: 400 }
  }

  const cookieStore = await cookies()
  const isEn = cookieStore.get('NEXT_LOCALE')?.value === 'en'
  const returnUrl = isEn
    ? `${process.env.NEXT_PUBLIC_APP_URL}/en/profile`
    : `${process.env.NEXT_PUBLIC_APP_URL}/perfil`

  const session = await stripe.billingPortal.sessions.create({
    customer: profile.stripe_customer_id,
    locale: isEn ? 'en' : 'es',
    return_url: returnUrl,
  })

  return { url: session.url }
}
