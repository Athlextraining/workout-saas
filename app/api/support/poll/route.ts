import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/modules/identity/application/get-current-user'
import { getCurrentProfile } from '@/modules/identity/application/get-current-profile'
import { listUserThreads } from '@/modules/support/application/list-user-threads'
import { listAllThreads } from '@/modules/support/application/list-all-threads'
import { getThread } from '@/modules/support/application/get-thread'
import { getUnreadCount } from '@/modules/support/application/get-unread-count'

export async function GET(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ authenticated: false })
  }

  const profile = await getCurrentProfile()
  const isAdmin = Boolean(profile?.is_admin)

  const threadParam = req.nextUrl.searchParams.get('thread')

  const [threads, unread, thread] = await Promise.all([
    isAdmin ? listAllThreads() : listUserThreads(),
    getUnreadCount(),
    threadParam ? getThread(threadParam) : Promise.resolve(null),
  ])

  return NextResponse.json({
    authenticated: true,
    isAdmin,
    unread,
    threads,
    thread,
  })
}
