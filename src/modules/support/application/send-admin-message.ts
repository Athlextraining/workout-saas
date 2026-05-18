'use server'

import { requireAdmin } from './require-admin'
import { createAdminThread } from '../infra/thread-repository'
import { validateBody, validateSubject } from '../domain/validators'

export async function sendAdminMessage(input: {
  userId: string
  userEmail: string
  subject: string
  body: string
}): Promise<{ error?: string; threadId?: string }> {
  await requireAdmin()

  const body = input.body.trim()
  const bodyErr = validateBody(body)
  if (bodyErr) return { error: bodyErr }

  const subject = input.subject.trim()
  const subjectErr = validateSubject(subject)
  if (subjectErr) return { error: subjectErr }

  const { thread, error } = await createAdminThread({
    userId: input.userId,
    subject,
    body,
  })
  if (error || !thread) return { error: error ?? 'No se pudo crear el hilo.' }

  return { threadId: thread.id }
}
