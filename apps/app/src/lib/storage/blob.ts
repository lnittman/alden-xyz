// Storage module for file uploads using Convex
import { useMutation } from "convex/react"
import { api } from "@repo/backend/convex/_generated/api"
import { Id } from "@repo/backend/convex/_generated/dataModel"

// Hook to upload a file
export function useUploadFile() {
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl)
  const createAsset = useMutation(api.assets.create)

  const uploadFile = async (file: File, metadata?: { 
    boardId?: string
    type?: 'image' | 'video' | 'pdf' | 'document' | 'other'
  }) => {
    // Step 1: Get a short-lived upload URL
    const postUrl = await generateUploadUrl()

    // Step 2: POST the file to the URL
    const result = await fetch(postUrl, {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file,
    })
    const { storageId } = await result.json()

    // Step 3: Save the file reference to the database
    const asset = await createAsset({
      storageId: storageId as Id<"_storage">,
      name: file.name,
      mimeType: file.type,
      size: file.size,
      boardId: metadata?.boardId as Id<"boards"> | undefined,
      type: metadata?.type || 'other',
    })

    return { storageId, assetId: asset }
  }

  return { uploadFile }
}

// Hook to delete a file
export function useDeleteFile() {
  const deleteAsset = useMutation(api.assets.delete)

  return {
    deleteFile: async (assetId: string) => {
      await deleteAsset({ id: assetId as Id<"assets"> })
    }
  }
}

// Hook to get file URL
export function useFileUrl() {
  const getUrl = useMutation(api.storage.getUrl)

  return {
    getFileUrl: async (storageId: string) => {
      const url = await getUrl({ storageId: storageId as Id<"_storage"> })
      return url
    }
  }
}