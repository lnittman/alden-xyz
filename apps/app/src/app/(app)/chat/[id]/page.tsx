"use client"

import React, { useState } from "react"
import { useParams } from "next/navigation"
import { useQuery } from "convex/react"
import { api } from "@repo/backend/convex/_generated/api"
import { Id } from "@repo/backend/convex/_generated/dataModel"
import { MessageList } from "@/components/chat/messages/MessageList"
import { MessageInput } from "@/components/chat/messages/MessageInput"
import { ChatHeader } from "@/components/chat/ChatHeader"
import { motion, AnimatePresence } from "framer-motion"
import { ContextBar } from "@/components/chat/context/ContextBar"
import { ContextPanel } from "@/components/chat/context/ContextPanel"
import { useChatContext } from "@/hooks/useChatContext"
import type { Context } from "@/types/ai/context"

export default function ChatRoomPage() {
  const params = useParams()
  const chatId = params.id as string
  const [isContextPanelOpen, setIsContextPanelOpen] = useState(false)
  const [activeContexts, setActiveContexts] = useState<Context[]>([])

  // Fetch chat and messages from Convex
  const chat = useQuery(api.chats.get, { id: chatId as Id<"chats"> })
  const messages = useQuery(api.messages.list, { chatId: chatId as Id<"chats"> }) || []

  // Get chat context data
  const {
    summary,
    topics,
    files,
    participants,
    isLoading: isContextLoading
  } = useChatContext(chatId)

  const handleContextRemove = (id: string) => {
    setActiveContexts(prev => prev.filter(ctx => ctx.id !== id))
  }

  if (!chat) return null

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <ContextBar 
        contexts={activeContexts}
        onContextRemove={handleContextRemove}
      />
      {/* Header */}
      <ChatHeader
        chatId={chatId}
        type={chat.type}
        title={chat.name || 'Chat'}
        participants={chat.memberIds || []}
        isContextPanelOpen={isContextPanelOpen}
        onContextPanelToggle={() => setIsContextPanelOpen(!isContextPanelOpen)}
      />

      {/* Context Panel */}
      <ContextPanel
        chatId={chatId}
        summary={summary}
        topics={topics}
        files={files}
        isOpen={isContextPanelOpen}
        onOpenChange={setIsContextPanelOpen}
      />

      {/* Messages or Welcome */}
      <div className="flex-1 flex flex-col min-h-0 relative">
        <AnimatePresence mode="wait">
          {messages.length === 0 ? (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute inset-0 flex items-center justify-center p-4"
            >
              <div className="text-center space-y-4 max-w-md">
                <h2 className="text-2xl tracking-tight">
                  <span className="font-extralight tracking-[-0.05em] text-white/70">new</span>
                  <span className="font-light text-white/90"> {chat.type === 'personal' ? 'note' : 'conversation'}</span>
                </h2>
                <p className="text-sm text-white/40 font-extralight leading-relaxed">
                  {chat.type === 'personal' 
                    ? "start writing your thoughts, ideas, or anything you'd like to remember."
                    : "start a new conversation. your messages are end-to-end encrypted."}
                </p>
              </div>
            </motion.div>
          ) : (
            <MessageList chatId={chatId} className="flex-1 px-3" />
          )}
        </AnimatePresence>
      </div>

      {/* Input */}
      <div className="px-4 pb-4 flex-shrink-0">
        <MessageInput chatId={chatId} />
      </div>
    </div>
  )
}
