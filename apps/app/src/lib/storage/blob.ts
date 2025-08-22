// Storage module for file uploads
import { api } from '@/lib/api/client'

export async function uploadFile(file: File, path: string) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('path', path)

  const response = await api.post('/files/upload', formData, {
    headers: {
      // Let browser set Content-Type with boundary for multipart
    }
  } as any)

  const data = await response.json()
  return data.data
}

export async function deleteFile(fileId: string) {
  const response = await api.delete(`/files/${fileId}`)
  const data = await response.json()
  return data.data
}

export async function getFileUrl(fileId: string) {
  const response = await api.get(`/files/${fileId}/url`)
  const data = await response.json()
  return data.data.url
}