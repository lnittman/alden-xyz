import type { Message } from '@/types'

export function adaptMessage(message: Message): Message {
  return {
    ...message,
    references: message.references || []
  }
}

export function adaptMessages(messages: Message[]): Message[] {
  return messages.map(adaptMessage)
} 