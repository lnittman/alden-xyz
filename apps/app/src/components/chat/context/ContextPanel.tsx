"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  MessageSquare, 
  FileText, 
  Users, 
  Activity,
  ChevronLeft,
  ChevronDown,
  ChevronUp
} from "lucide-react"
import { ContextPreview } from "./ContextPreview"
import { 
  Tooltip, 
  TooltipContent, 
  TooltipTrigger,
  TooltipProvider 
} from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible"
import { Slider } from "@/components/ui/slider"

interface ChatSummary {
  title: string
  description: string
  keyPhrases: string[]
}

interface Topic {
  id: string
  title: string
  count: number
  relevance: number
}

interface RelatedFile {
  id: string
  name: string
  type: string
  lastModified: string
  relevance: number
}

interface ActivityData {
  date: string
  topics: number
  messages: number
  files: number
  participants: number
}

type FilterType = 'activity' | 'topics' | 'files'

interface ContextPanelProps {
  chatId: string
  summary: any
  topics: any[]
  files: any[]
  className?: string
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onTopicClick?: (topic: any) => void
  onFileClick?: (file: any) => void
}

interface MessageData {
  id: string
  created_at: string
  content: string
}

interface FileData {
  id: string
  created_at: string
  name: string
  type: string
}

interface ActivityItem {
  id: string
  type: 'message' | 'file' | 'thread' | 'topic'
  title: string
  preview?: string
  metadata: {
    created_at: string
    [key: string]: any
  }
}

const filterOptions: { id: FilterType; label: string }[] = [
  { id: 'activity', label: 'activity' },
  { id: 'topics', label: 'topics' },
  { id: 'files', label: 'files' }
]

export function ContextPanel({
  chatId,
  summary,
  topics,
  files,
  className,
  isOpen,
  onOpenChange,
  onTopicClick,
  onFileClick
}: ContextPanelProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>('activity')
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [activityData, setActivityData] = useState<ActivityData[]>([])
  const [selectedDateItems, setSelectedDateItems] = useState<ActivityItem[]>([])
  const [timelinePosition, setTimelinePosition] = useState(100) // 100 = present, 0 = 30 days ago

  // Fetch real activity data
  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const response = await api.get(`/chats/${chatId}/activity`)
        const data = await response.json()
        
        if (data.success && data.data) {
          setActivityData(data.data)
        } else {
          // Fallback: Initialize with empty activity data
          const activity: ActivityData[] = Array.from({ length: 30 }, (_, i) => {
            const date = new Date()
            date.setDate(date.getDate() - i)
            date.setHours(0, 0, 0, 0)
            return {
              date: date.toISOString(),
              topics: 0,
              messages: 0,
              files: 0,
              participants: 0
            }
          })
          setActivityData(activity)
        }
      } catch (error) {
        console.error('Error fetching activity:', error)
        // Initialize with empty activity data on error
        const activity: ActivityData[] = Array.from({ length: 30 }, (_, i) => {
          const date = new Date()
          date.setDate(date.getDate() - i)
          date.setHours(0, 0, 0, 0)
          return {
            date: date.toISOString(),
            topics: 0,
            messages: 0,
            files: 0,
            participants: 0
          }
        })
        setActivityData(activity)
      }
    }

    if (chatId) {
      fetchActivity()
    }
  }, [chatId])

  // Fetch items for selected date
  useEffect(() => {
    const fetchDateItems = async () => {
      if (!selectedDate) return

      try {
        const response = await api.get(
          `/chats/${chatId}/activity/items?date=${selectedDate}`
        )
        const data = await response.json()
        
        if (data.success && data.data) {
          setSelectedDateItems(data.data)
        } else {
          setSelectedDateItems([])
        }
      } catch (error) {
        console.error('Error fetching date items:', error)
        setSelectedDateItems([])
      }
    }

    fetchDateItems()
  }, [selectedDate, chatId])

  const getActivityColor = (value: number, max: number) => {
    if (max === 0) return 'bg-white/[0.02]'
    const intensity = value / max
    if (intensity === 0) return 'bg-white/[0.02]'
    if (intensity < 0.25) return 'bg-[#178bf1]/20'
    if (intensity < 0.5) return 'bg-[#178bf1]/30'
    if (intensity < 0.75) return 'bg-[#178bf1]/40'
    return 'bg-[#178bf1]/50'
  }

  // Calculate activity data based on timeline position
  const visibleActivityData = React.useMemo(() => {
    const daysToShow = Math.floor((100 - timelinePosition) / (100 / 30))
    return activityData.slice(0, daysToShow + 1)
  }, [activityData, timelinePosition])

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const getActivitySummary = (data: ActivityData) => {
    const type = activeFilter === 'activity' ? 'messages' : activeFilter
    const count = type === 'messages' ? data.messages :
                 type === 'topics' ? data.topics :
                 type === 'files' ? data.files : 0
    return `${count} ${type}`
  }

  return (
    <div className={cn("relative", className)}>
      <div className={cn(
        "absolute inset-0 bg-gradient-to-b from-black/20 to-transparent",
        "transition-opacity duration-300",
        isOpen ? "opacity-100" : "opacity-0"
      )} />
      
      {/* Content */}
      <div className={cn(
        "relative space-y-6 p-6",
        "transition-all duration-300",
        isOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
      )}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="relative bg-black/40 backdrop-blur-sm rounded-lg p-6 border border-white/5"
          style={{ minHeight: '280px' }}
        >
          <AnimatePresence mode="wait">
            {selectedDate ? (
              // Selected Date View
              <motion.div
                key="selected-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="h-full flex flex-col space-y-4"
              >
                <div className="flex items-center justify-between flex-shrink-0">
                  <button
                    onClick={() => setSelectedDate(null)}
                    className="flex items-center gap-2 text-white/40 hover:text-white/60 transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="text-sm font-light">back</span>
                  </button>
                  <span className="text-sm font-light text-white/40">
                    {formatDate(selectedDate)}
                  </span>
                </div>
                <ScrollArea className="w-full flex-1 min-h-0" orientation="horizontal">
                  <div className="flex gap-4 pb-4" style={{ width: 'max-content' }}>
                    {selectedDateItems.map((item, i) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2, delay: i * 0.05 }}
                      >
                        <ContextPreview
                          type={item.type === 'message' ? 'thread' : (item.type as 'file' | 'topic')}
                          title={item.title}
                          metadata={{ 
                            description: item.preview,
                            created_at: item.metadata.created_at 
                          }}
                        />
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              </motion.div>
            ) : (
              // Grid View
              <motion.div
                key="grid-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="h-full flex flex-col space-y-4"
              >
                {/* Filter options */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  {filterOptions.map((filter, i) => (
                    <motion.button
                      key={filter.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2, delay: i * 0.05 }}
                      onClick={() => setActiveFilter(filter.id)}
                      className={cn(
                        "text-sm font-light transition-colors",
                        activeFilter === filter.id 
                          ? "text-white/90" 
                          : "text-white/40 hover:text-white/60"
                      )}
                    >
                      {filter.label}
                    </motion.button>
                  ))}
                </div>

                {/* Heat Map Grid */}
                <TooltipProvider>
                  <div className="grid grid-cols-30 grid-rows-3 gap-1 flex-1">
                    {visibleActivityData.map((day, i) => (
                      <Tooltip key={day.date}>
                        <TooltipTrigger asChild>
                          <motion.button
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ 
                              duration: 0.2,
                              delay: Math.min(0.3 + (i * 0.01), 0.8)
                            }}
                            className={cn(
                              "w-full aspect-square rounded-sm transition-all duration-200",
                              getActivityColor(
                                day[activeFilter === 'activity' ? 'messages' : activeFilter],
                                Math.max(...visibleActivityData.map(d => d[activeFilter === 'activity' ? 'messages' : activeFilter]))
                              ),
                              "hover:opacity-80",
                              selectedDate === day.date && "ring-2 ring-[#178bf1]/40"
                            )}
                            onClick={() => setSelectedDate(selectedDate === day.date ? null : day.date)}
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="text-xs space-y-1">
                            <p className="font-light">{formatDate(day.date)}</p>
                            <p className="text-white/60">{getActivitySummary(day)}</p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                </TooltipProvider>

                {/* Timeline Scrubber */}
                <div className="pt-4 px-2">
                  <Slider
                    value={[timelinePosition]}
                    onValueChange={([value]) => setTimelinePosition(value)}
                    min={0}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between mt-2 text-xs text-white/40 font-light">
                    <span>30 days ago</span>
                    <span>now</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Horizontal Scrollable Context */}
        <AnimatePresence>
          {!selectedDate && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <ScrollArea className="w-full" orientation="horizontal">
                <div className="flex gap-4 pb-4" style={{ width: 'max-content' }}>
                  {activeFilter === 'topics' && topics.map((topic) => (
                    <ContextPreview
                      key={topic.id}
                      type="topic"
                      title={topic.title}
                      metadata={{
                        description: `${topic.count} messages`,
                        relevance: topic.relevance
                      }}
                      onClick={() => onTopicClick?.(topic)}
                    />
                  ))}
                  {activeFilter === 'files' && files.map((file) => (
                    <ContextPreview
                      key={file.id}
                      type="file"
                      title={file.name}
                      metadata={{
                        description: file.type,
                        lastModified: file.lastModified,
                        relevance: file.relevance
                      }}
                      onClick={() => onFileClick?.(file)}
                    />
                  ))}
                </div>
              </ScrollArea>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
} 