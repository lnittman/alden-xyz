"use client"

import React, { useEffect, useRef } from "react"
import { useQuery } from "convex/react"
import { api } from "@repo/backend/convex/_generated/api"
import { Id } from "@repo/backend/convex/_generated/dataModel"
import { cn } from "@/lib/utils"
import { MessageBubble } from "./MessageBubble"
import { AnimatePresence, motion } from "framer-motion"

interface MessageListProps {
  chatId: string
  className?: string
}

export function MessageList({ chatId, className }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const lastMessageRef = useRef<string | null>(null)
  const isNearBottomRef = useRef(true)

  // Fetch messages from Convex
  const messages = useQuery(
    api.messages.list,
    chatId ? { chatId: chatId as Id<"chats"> } : "skip"
  ) || []

  useEffect(() => {
    const scrollContainer = scrollRef.current
    if (!scrollContainer) return

    // Check if we're near the bottom before a new message comes in
    const checkIfNearBottom = () => {
      if (!scrollContainer) return
      const threshold = 100 // pixels from bottom
      const position = scrollContainer.scrollHeight - scrollContainer.scrollTop - scrollContainer.clientHeight
      isNearBottomRef.current = position < threshold
    }

    // Add scroll listener
    scrollContainer.addEventListener('scroll', checkIfNearBottom)
    return () => scrollContainer.removeEventListener('scroll', checkIfNearBottom)
  }, [])

  useEffect(() => {
    // If we have messages and either:
    // 1. This is the first load (no last message ref)
    // 2. We have a new message (last message id changed)
    // 3. We were near the bottom when the new message came in
    if (messages.length > 0 && 
      (!lastMessageRef.current || 
       lastMessageRef.current !== messages[messages.length - 1]._id) &&
       isNearBottomRef.current) {
      // Update our ref
      lastMessageRef.current = messages[messages.length - 1]._id
      
      // Scroll to bottom
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight
      }
    }
  }, [messages])

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div 
        ref={scrollRef}
        className={cn(
          "flex-1 overflow-y-auto",
          className
        )}
      >
        <div className="flex flex-col justify-end min-h-full">
          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <motion.div
                key={message._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="px-4 py-2"
              >
                <MessageBubble message={message} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
} 