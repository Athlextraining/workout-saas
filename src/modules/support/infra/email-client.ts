import { Resend } from 'resend'

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
}

export async function sendNewMessageToAdmin(input: NewMessageInput) {
  if (!resend || !ADMIN) return { skipped: true }
  const link = `${input.appUrl}/admin/mensajes/${input.threadId}`
  await resend.emails.send({
    from: FROM,
    to: ADMIN,
    replyTo: input.userEmail,
    subject: `Mensaje de ${input.userEmail}`,
    text: `${input.body}\n\n— ver hilo: ${link}`,
  })
  return { skipped: false }
}

export async function sendReplyToUser(input: ReplyInput) {
  if (!resend || !ADMIN) return { skipped: true }
  const link = `${input.appUrl}/preguntanos/${input.threadId}`
  await resend.emails.send({
    from: FROM,
    to: input.userEmail,
    replyTo: ADMIN,
    subject: `Re: [ATHLEX] ${input.subject}`,
    text: `${input.body}\n\n— responde desde la app: ${link}`,
  })
  return { skipped: false }
}

export async function sendUserReplyToAdmin(input: NewMessageInput) {
  if (!resend || !ADMIN) return { skipped: true }
  const link = `${input.appUrl}/admin/mensajes/${input.threadId}`
  await resend.emails.send({
    from: FROM,
    to: ADMIN,
    replyTo: input.userEmail,
    subject: `Mensaje de ${input.userEmail}`,
    text: `${input.body}\n\n— ver hilo: ${link}`,
  })
  return { skipped: false }
}
