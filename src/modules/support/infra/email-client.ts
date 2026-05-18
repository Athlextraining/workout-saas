import { Resend } from 'resend'
import { getTranslations } from 'next-intl/server'
import type { Locale } from '@/shared/i18n/config'

const key = process.env.RESEND_API_KEY
const resend = key ? new Resend(key) : null

const FROM = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
const ADMIN = process.env.ADMIN_EMAIL || ''

interface NewMessageInput {
  threadId: string
  subject: string
  body: string
  userEmail: string
  appUrl: string
}

interface ReplyInput {
  threadId: string
  subject: string
  body: string
  userEmail: string
  appUrl: string
  recipientLocale: Locale
}

export async function sendNewMessageToAdmin(input: NewMessageInput) {
  if (!resend || !ADMIN) return { skipped: true }
  const t = await getTranslations({ locale: 'es', namespace: 'emails.newMessageToAdmin' })
  const link = `${input.appUrl}/admin/mensajes/${input.threadId}`
  await resend.emails.send({
    from: FROM,
    to: ADMIN,
    replyTo: input.userEmail,
    subject: t('subject', { userEmail: input.userEmail }),
    text: `${input.body}\n\n${t('bodyTrailer', { link })}`,
  })
  return { skipped: false }
}

export async function sendReplyToUser(input: ReplyInput) {
  if (!resend || !ADMIN) return { skipped: true }
  const t = await getTranslations({
    locale: input.recipientLocale,
    namespace: 'emails.replyToUser',
  })
  await resend.emails.send({
    from: FROM,
    to: input.userEmail,
    replyTo: ADMIN,
    subject: t('subject', { subject: input.subject }),
    text: input.body,
  })
  return { skipped: false }
}

export async function sendUserReplyToAdmin(input: NewMessageInput) {
  if (!resend || !ADMIN) return { skipped: true }
  const t = await getTranslations({ locale: 'es', namespace: 'emails.userReplyToAdmin' })
  const link = `${input.appUrl}/admin/mensajes/${input.threadId}`
  await resend.emails.send({
    from: FROM,
    to: ADMIN,
    replyTo: input.userEmail,
    subject: t('subject', { userEmail: input.userEmail }),
    text: `${input.body}\n\n${t('bodyTrailer', { link })}`,
  })
  return { skipped: false }
}
