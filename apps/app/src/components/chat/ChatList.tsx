"use client"

import React, { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { api } from "@/lib/api/client"
import { useDispatch, useSelector } from 'react-redux'
import { 
  setChats, 
  updateChat, 
  markChatAsRead,
  setSearchQuery,
  setFilterType,
  selectPinnedChats,
  selectRecentChats,
  removeChat
} from '@/lib/redux/slices/chatSlice'
import { cn } from "@/lib/utils"
import { RootState } from '@/lib/redux/store'
import { ChatSearch } from "./sidebar/ChatSearch"
import { ChatFilters, ChatFilterType } from "./sidebar/ChatFilters"
import { PinnedChats } from "./sidebar/PinnedChats"
import { ChatItem } from "./sidebar/ChatItem"
import { AnimatePresence, motion } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"
import { useHotkeys } from "react-hotkeys-hook"
import { useUser } from "@clerk/nextjs"
import type { Chat } from '@/types/api/chat'

interface ChatListProps {
  className?: string
}

export function ChatList({ className }: ChatListProps) {
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const params = useParams()
  const dispatch = useDispatch()
  const currentChatId = params?.id as string

  // Get current user from Clerk
  const { user } = useUser()

  // Get filter state from Redux
  const searchQuery = useSelector((state: RootState) => state.chat.filters.search)
  const filterType = useSelector((state: RootState) => state.chat.filters.type)
  const pinnedChats = useSelector(selectPinnedChats)
  const recentChats = useSelector(selectRecentChats)

  // Load initial chats
  useEffect(() => {
    if (!user) return
    
    api.get('/chats')
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          dispatch(setChats(data.data || []))
        }
        setIsLoading(false)
      })
      .catch(error => {
        console.error('Failed to load chats:', error)
        setIsLoading(false)
      })
  }, [dispatch, user])

  // TODO: Implement real-time chat updates
  // For now, we'll poll for updates or implement server-sent events
  useEffect(() => {
    if (!user) return

    // Refresh chats periodically to simulate real-time updates
    const refreshInterval = setInterval(() => {
      api.get('/chats')
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            dispatch(setChats(data.data || []))
          }
        })
        .catch(console.error)
    }, 30000) // Refresh every 30 seconds

    return () => clearInterval(refreshInterval)
  }, [dispatch, user])

  // Handle chat click
  const handleChatClick = async (chatId: string) => {
    try {
      // Update UI immediately
      dispatch(markChatAsRead(chatId))
      
      // Navigate and update server
      router.push(`/chat/${chatId}`)
      await api.patch(`/chats/${chatId}/read`, {})
    } catch (error) {
      console.error('Failed to mark chat as read:', error)
      // Revert the UI change if the API call failed
      dispatch(updateChat({ id: chatId, has_unread: true }))
    }
  }

  // Keyboard shortcuts
  useHotkeys('esc', () => {
    if (searchQuery) {
      dispatch(setSearchQuery(''))
    }
  })

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
          onChange={(value) => dispatch(setSearchQuery(value))}
        />
      </div>

      {/* Filters - edge to edge */}
      <div className="overflow-x-auto scrollbar-none">
        <div className="min-w-max">
          <ChatFilters
            value={filterType}
            onChange={(value) => dispatch(setFilterType(value))}
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
