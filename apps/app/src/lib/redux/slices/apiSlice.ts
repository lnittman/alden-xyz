import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react'
import { api } from '@/lib/api/client'
import type { Chat } from '@/types/api/chat'
import type { Message } from '@/types/api/message'

export const apiSlice = createApi({
  baseQuery: fakeBaseQuery(),
  tagTypes: ['Chat', 'User'],
  endpoints: (builder) => ({
    getChats: builder.query<Chat[], void>({
      queryFn: async () => {
        try {
          const response = await api.get('/chats')
          const data = await response.json()
          
          if (!data.success) throw new Error(data.error || 'Failed to fetch chats')
          return { data: data.data as Chat[] }
        } catch (error) {
          return { error: error as Error }
        }
      },
      providesTags: ['Chat'],
    }),

    getChatById: builder.query<Chat, string>({
      queryFn: async (chatId) => {
        try {
          const response = await api.get(`/chats/${chatId}`)
          const data = await response.json()
          
          if (!data.success) throw new Error(data.error || 'Failed to fetch chat')
          return { data: data.data as Chat }
        } catch (error) {
          return { error: error as Error }
        }
      },
      providesTags: (_result, _error, id) => [{ type: 'Chat', id }],
    }),

    createChat: builder.mutation<Chat, Partial<Chat>>({
      queryFn: async (chat) => {
        try {
          const response = await api.post('/chats', chat)
          const data = await response.json()
          
          if (!data.success) throw new Error(data.error || 'Failed to create chat')
          return { data: data.data as Chat }
        } catch (error) {
          return { error: error as Error }
        }
      },
      invalidatesTags: ['Chat'],
    }),

    updateChat: builder.mutation<Chat, { id: string; chat: Partial<Chat> }>({
      queryFn: async ({ id, chat }) => {
        try {
          const response = await api.patch(`/chats/${id}`, chat)
          const data = await response.json()
          
          if (!data.success) throw new Error(data.error || 'Failed to update chat')
          return { data: data.data as Chat }
        } catch (error) {
          return { error: error as Error }
        }
      },
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Chat', id }],
    }),

    deleteChat: builder.mutation<void, string>({
      queryFn: async (id) => {
        try {
          const response = await api.delete(`/chats/${id}`)
          const data = await response.json()
          
          if (!data.success) throw new Error(data.error || 'Failed to delete chat')
          return { data: undefined }
        } catch (error) {
          return { error: error as Error }
        }
      },
      invalidatesTags: ['Chat'],
    }),

    getProfile: builder.query<any, void>({
      queryFn: async () => {
        try {
          const response = await api.get('/users/me')
          const data = await response.json()
          
          if (!data.success) throw new Error(data.error || 'Failed to fetch profile')
          return { data: data.data }
        } catch (error) {
          return { error: error as Error }
        }
      },
      providesTags: ['User'],
    }),
  }),
})

export const {
  useGetChatsQuery,
  useGetChatByIdQuery,
  useCreateChatMutation,
  useUpdateChatMutation,
  useDeleteChatMutation,
  useGetProfileQuery,
} = apiSlice