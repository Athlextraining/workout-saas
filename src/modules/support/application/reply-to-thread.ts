'use server'

import { getCurrentUser } from '@/modules/identity/application/get-current-user'
import { getCurrentProfile } from '@/modules/identity/application/get-current-profile'
import { addMessage, getThreadById } from '../infra/thread-repository'
import {
  sendReplyToUser,
  sendUserReplyToAdmin,
} from '../infra/email-client'
import { validateBody } from '../domain/validators'

export async function replyToThread(input: {
  threadId: string
  body: string
}): Promise<{ error?: string }> {
  const user = await getCurrentUser()
  if (!user) return { error: 'No autenticado.' }

  const bodyErr = validateBody(input.body)
  if (bodyErr) return { error: bodyErr }

  const body = input.body.trim()

  const threadData = await getThreadById(input.threadId)
  if (!threadData) return { error: 'Hilo no encontrado.' }

  const profile = await getCurrentProfile()
  const isAdmin = Boolean(profile?.is_admin)
  const isOwner = threadData.thread.user_id === user.id

  if (!isAdmin && !isOwner) return { error: 'Sin permiso.' }

  const author = isAdmin && !isOwner ? 'admin' : isAdmin && isOwner ? 'admin' : 'user'

  const { error } = await addMessage({
    threadId: input.threadId,
    author,
    body,
  })
  if (error) return { error }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  try {
    if (author === 'admin' && threadData.user_email) {
      await sendReplyToUser({
        threadId: input.threadId,
        subject: threadData.thread.subject,
        body,
        userEmail: threadData.user_email,
        appUrl,
      })
    } else if (author === 'user') {
      await sendUserReplyToAdmin({
        threadId: input.threadId,
        subject: threadData.thread.subject,
        body,
        userEmail: user.email ?? '',
        appUrl,
      })
    }
  } catch (e) {
    console.error('Resend error (reply):', e)
  }

  return {}
}
