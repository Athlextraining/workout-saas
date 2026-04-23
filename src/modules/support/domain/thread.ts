export type ThreadStatus = 'open' | 'closed'
export type MessageAuthor = 'user' | 'admin'

export interface SupportMessage {
  id: string
  thread_id: string
  author: MessageAuthor
  body: string
  created_at: string
}

export interface SupportThread {
  id: string
  user_id: string
  subject: string
  status: ThreadStatus
  created_at: string
  updated_at: string
}

export interface SupportThreadWithMeta extends SupportThread {
  user_email?: string
  last_message_preview?: string
  last_message_author?: MessageAuthor
  last_message_at?: string
  unread_for_admin?: boolean
}

export interface SupportThreadWithMessages {
  thread: SupportThread
  messages: SupportMessage[]
  user_email?: string
}
