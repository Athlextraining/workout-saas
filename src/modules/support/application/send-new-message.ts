'use server'

import { getCurrentUser } from '@/modules/identity/application/get-current-user'
import { createThread } from '../infra/thread-repository'
import { sendNewMessageToAdmin } from '../infra/email-client'
import { validateBody, validateSubject } from '../domain/validators'

export async function sendNewMessage(input: {
  subject?: string
  body: string
}): Promise<{ error?: string; threadId?: string }> {
  const user = await getCurrentUser()
  if (!user) return { error: 'No autenticado.' }

  const body = input.body.trim()
  const bodyErr = validateBody(body)
  if (bodyErr) return { error: bodyErr }

  const rawSubject = input.subject?.trim() ?? ''
  const subject = rawSubject.length > 0 ? rawSubject : deriveSubject(body)
  const subjectErr = validateSubject(subject)
  if (subjectErr) return { error: subjectErr }

  const { thread, error } = await createThread({ userId: user.id, subject, body })
  if (error || !thread) return { error: error ?? 'No se pudo crear el hilo.' }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  try {
    await sendNewMessageToAdmin({
      threadId: thread.id,
      subject,
      body,
      userEmail: user.email ?? '',
      appUrl,
    })
  } catch (e) {
    console.error('Resend error (new message):', e)
  }

  return { threadId: thread.id }
}

function deriveSubject(body: string): string {
  const firstLine = body.split('\n')[0].trim()
  const truncated = firstLine.length > 80 ? firstLine.slice(0, 77) + '…' : firstLine
  return truncated.length >= 3 ? truncated : 'Consulta'
}
