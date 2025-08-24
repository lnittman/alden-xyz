"use client"

import { useState, useEffect } from "react"
import { useMutation } from "convex/react"
import { api } from "@repo/backend/convex/_generated/api"

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
  
  const findReferences = useMutation(api.ai.findReferences)

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
        const result = await findReferences({
          query: text,
          chatId
        })

        if (!isCancelled && result) {
          setReferences(result.matches || [])
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
  }, [text, chatId, findReferences])

  return { references, isLoading, error }
} 
