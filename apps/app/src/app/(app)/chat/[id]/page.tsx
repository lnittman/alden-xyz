"use client"

import React, { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { MessageService } from "@/lib/services/message"
import { ChatService } from "@/lib/services/chat"
import type { Message } from "@/types"
import { MessageList } from "@/components/chat/messages/MessageList"
import { MessageInput } from "@/components/chat/messages/MessageInput"
import { ChatHeader } from "@/components/chat/ChatHeader"
import { motion, AnimatePresence } from "framer-motion"
import { useSelector, useDispatch } from "react-redux"
import { useUser } from "@clerk/nextjs"
import { useAppDispatch, useAppSelector } from "@/lib/redux/store"
import { RootState } from "@/lib/redux/store"
import { setActiveContexts, removeContext } from "@/lib/redux/slices/chatSlice"
import { ContextService } from "@/lib/ai/context"
import { ContextBar } from "@/components/chat/context/ContextBar"
import { ContextPanel } from "@/components/chat/context/ContextPanel"
import { useChatContext } from "@/hooks/useChatContext"
import { api } from "@/lib/api/client"
import type { Context } from "@/types/ai/context"

export default function ChatRoomPage() {
  const params = useParams()
  const chatId = params.id as string
  const [messages, setMessages] = useState<any[]>([])
  const [localChat, setLocalChat] = useState<any>()
  const [isContextPanelOpen, setIsContextPanelOpen] = useState(false)
  const dispatch = useAppDispatch()
  const { activeContexts } = useSelector((state: RootState) => state.chat.context)
  const chat = useSelector((state: any) => 
    state.chats?.data?.find((c: any) => c.id === chatId)
  ) || localChat

  // Get chat context data
  const {
    summary,
    topics,
    files,
    participants,
    isLoading: isContextLoading
  } = useChatContext(chatId)

  // Add before the useEffect
  const handleContextChange = async (payload: any) => {
    // Fetch updated context data
    const contexts = await ContextService.getMessageContexts(chatId)
    const typeMap: Record<string, any> = {
      user: 'user',
      thread: 'thread',
      url: 'topic',
      file: 'file'
    }

    const transformedContexts = contexts.map((ctx: any) => ({
      id: ctx.id,
      type: typeMap[ctx.type] || 'topic',
      title: ctx.metadata.title || ctx.metadata.name || ctx.metadata.full_name || 'Untitled',
      subtitle: ctx.metadata.description || ctx.metadata.email,
      metadata: {
        ...ctx.metadata,
        title: ctx.metadata.title || ctx.metadata.name || ctx.metadata.full_name || 'Untitled',
        description: ctx.metadata.description || ctx.metadata.email
      }
    } as Context))
    dispatch(setActiveContexts(transformedContexts))
  }

  useEffect(() => {
    if (!chat) {
      // If chat is not in the store, fetch it directly
      api.get(`/chats/${chatId}`)
        .then(response => response.json())
        .then(data => {
          if (data.success && data.data) {
            setLocalChat(data.data)
          }
        })
        .catch(console.error)
    }

    // Get messages
    api.get(`/chats/${chatId}/messages`)
      .then(response => response.json())
      .then(data => {
        if (data.success && data.data) {
          setMessages(data.data)
        }
      })
      .catch(console.error)
  }, [chatId, chat])

  // Fetch initial context
  useEffect(() => {
    ContextService.getMessageContexts(chatId)
      .then((ctxs: any) => {
        const typeMap: Record<string, any> = {
          user: 'user',
          thread: 'thread',
          url: 'topic',
          file: 'file'
        }

        const transformedContexts = ctxs.map((ctx: any) => ({
          id: ctx.id,
          type: typeMap[ctx.type] || 'topic',
          title: ctx.metadata.title || ctx.metadata.name || ctx.metadata.full_name || 'Untitled',
          subtitle: ctx.metadata.description || ctx.metadata.email,
          metadata: {
            ...ctx.metadata,
            title: ctx.metadata.title || ctx.metadata.name || ctx.metadata.full_name || 'Untitled',
            description: ctx.metadata.description || ctx.metadata.email
          }
        } as Context))
        dispatch(setActiveContexts(transformedContexts))
      })
  }, [chatId, dispatch])

  // TODO: Implement real-time context updates using WebSocket or SSE
  useEffect(() => {
    // Real-time updates will be implemented with WebSocket connection to API
    // For now, polling can be used as a fallback
  }, [chatId])

  if (!chat) return null

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <ContextBar 
        contexts={activeContexts as unknown as Context[]}
        onContextRemove={(id) => dispatch(removeContext(id))}
      />
      {/* Header */}
      <ChatHeader
        chatId={chatId}
        type={chat.type}
        title={chat.title}
        participants={chat.chat_participants}
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
            <MessageList messages={messages} className="flex-1 px-3" />
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
