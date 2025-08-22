"use client"

import { useState, useEffect } from "react"
import { api } from "@/lib/api/client"

export interface Reference {
  id: string
  type: string
  title: string
  content: any
  metadata: any
  similarity: number
}

export function useReferences(text: string, chatId: string) {
  const [references, setReferences] = useState<Reference[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let isCancelled = false

    async function detectReferences() {
      if (!text.trim()) {
      setReferences([])
      return
    }

    setIsLoading(true)
    setError(null)

    try {
        const response = await api.post("/ai/find-references", {
          query: text,
          chatId
        })
        
        const data = await response.json()

        if (!isCancelled) {
          setReferences(data.matches || [])
        }
    } catch (err) {
        if (!isCancelled) {
          console.error("Error detecting references:", err)
          setError(err instanceof Error ? err : new Error("Failed to detect references"))
        }
    } finally {
        if (!isCancelled) {
      setIsLoading(false)
    }
      }
    }

    // Debounce reference detection to avoid too many API calls
    const timeoutId = setTimeout(detectReferences, 300)

    return () => {
      isCancelled = true
      clearTimeout(timeoutId)
    }
  }, [text, chatId])

  return { references, isLoading, error }
} 
