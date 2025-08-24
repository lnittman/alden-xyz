"use client"

import React, { useState, useMemo } from "react"
import { useRouter, useParams } from "next/navigation"
import { useQuery, useMutation } from "convex/react"
import { api } from "@repo/backend/convex/_generated/api"
import { Id } from "@repo/backend/convex/_generated/dataModel"
import { cn } from "@/lib/utils"
import { ChatSearch } from "./sidebar/ChatSearch"
import { ChatFilters, ChatFilterType } from "./sidebar/ChatFilters"
import { PinnedChats } from "./sidebar/PinnedChats"
import { ChatItem } from "./sidebar/ChatItem"
import { AnimatePresence, motion } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"
import { useHotkeys } from "react-hotkeys-hook"

interface ChatListProps {
  className?: string
}

export function ChatList({ className }: ChatListProps) {
  const router = useRouter()
  const params = useParams()
  const currentChatId = params?.id as string

  // Local state for filters
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<ChatFilterType>("all")

  // Get chats from Convex - real-time updates automatically
  const chats = useQuery(api.chats.list)
  const markAsRead = useMutation(api.chats.markAsRead)

  // Filter and organize chats
  const { pinnedChats, recentChats } = useMemo(() => {
    if (!chats) return { pinnedChats: [], recentChats: [] }

    let filtered = [...chats]

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(chat => 
        chat.name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(chat => {
        switch (filterType) {
          case 'direct':
            return chat.type === 'direct'
          case 'group':
            return chat.type === 'group'
          case 'archived':
            return chat.archived
          case 'personal':
            return chat.type === 'personal'
          default:
            return true
        }
      })
    }

    // Separate pinned and recent
    const pinned = filtered.filter(chat => chat.pinned).sort((a, b) => 
      (b.lastMessageAt || b._creationTime) - (a.lastMessageAt || a._creationTime)
    )
    const recent = filtered.filter(chat => !chat.pinned).sort((a, b) => 
      (b.lastMessageAt || b._creationTime) - (a.lastMessageAt || a._creationTime)
    )

    return { pinnedChats: pinned, recentChats: recent }
  }, [chats, searchQuery, filterType])

  // Handle chat click
  const handleChatClick = async (chatId: string) => {
    try {
      // Navigate
      router.push(`/chat/${chatId}`)
      // Mark as read
      await markAsRead({ chatId: chatId as Id<"chats"> })
    } catch (error) {
      console.error('Failed to mark chat as read:', error)
    }
  }

  // Keyboard shortcuts
  useHotkeys('esc', () => {
    if (searchQuery) {
      setSearchQuery('')
    }
  })

  const isLoading = chats === undefined

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="space-y-2"
          >
            <Skeleton className="h-5 w-[60%]" />
            <Skeleton className="h-4 w-[85%]" />
            <Skeleton className="h-4 w-[70%]" />
          </motion.div>
        ))}
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col min-h-0", className)}>
      {/* Pinned chats - above search */}
      <PinnedChats chats={pinnedChats} />

      {/* Search */}
      <div className="px-4 pt-4 pb-2">
        <ChatSearch
          value={searchQuery}
          onChange={setSearchQuery}
        />
      </div>

      {/* Filters - edge to edge */}
      <div className="overflow-x-auto scrollbar-none">
        <div className="min-w-max">
          <ChatFilters
            value={filterType}
            onChange={setFilterType}
          />
        </div>
      </div>

      {/* Chat lists */}
      <div className="flex-1 overflow-y-auto py-2">
        {recentChats.length === 0 ? (
          <div className="p-4">
            <div className="text-sm text-white/40 font-extralight">
              {filterType === 'archived' ? 'no archived chats...' :
               filterType === 'direct' ? 'no direct chats...' :
               filterType === 'personal' ? 'no personal chats...' :
               filterType === 'group' ? 'no group chats...' :
               'no chats yet'}
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            <AnimatePresence mode="popLayout">
              {recentChats.map((chat) => (
                <motion.div
                  key={chat.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                  className="px-2"
                >
                  <ChatItem chat={chat} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
} 
