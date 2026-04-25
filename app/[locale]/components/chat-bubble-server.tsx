import { createSupabaseServerClient } from '@/shared/infra/supabase/server'
import { ChatBubble } from './chat-bubble'

export async function ChatBubbleServer() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <ChatBubble initialMode="anon" />
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .maybeSingle()

  // Admins use the navbar bell instead of the bubble
  if (profile?.is_admin) return null

  return <ChatBubble initialMode="user" />
}
