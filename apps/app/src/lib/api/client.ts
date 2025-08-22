import { useAuth } from '@clerk/nextjs'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787'

interface RequestOptions extends RequestInit {
  token?: string
}

class APIClient {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private async request(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<Response> {
    const { token, headers, ...fetchOptions } = options

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...fetchOptions,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...headers,
      },
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`)
    }

    return response
  }

  async get(endpoint: string, options?: RequestOptions) {
    return this.request(endpoint, { ...options, method: 'GET' })
  }

  async post(endpoint: string, data?: any, options?: RequestOptions) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put(endpoint: string, data?: any, options?: RequestOptions) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async patch(endpoint: string, data?: any, options?: RequestOptions) {
    return this.request(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete(endpoint: string, options?: RequestOptions) {
    return this.request(endpoint, { ...options, method: 'DELETE' })
  }
}

export const api = new APIClient(API_URL)

// Hook for authenticated requests
export function useAuthenticatedAPI() {
  const { getToken } = useAuth()

  return {
    get: async (endpoint: string) => {
      const token = await getToken()
      return api.get(endpoint, { token: token || undefined })
    },
    post: async (endpoint: string, data?: any) => {
      const token = await getToken()
      return api.post(endpoint, data, { token: token || undefined })
    },
    put: async (endpoint: string, data?: any) => {
      const token = await getToken()
      return api.put(endpoint, data, { token: token || undefined })
    },
    patch: async (endpoint: string, data?: any) => {
      const token = await getToken()
      return api.patch(endpoint, data, { token: token || undefined })
    },
    delete: async (endpoint: string) => {
      const token = await getToken()
      return api.delete(endpoint, { token: token || undefined })
    },
  }
}