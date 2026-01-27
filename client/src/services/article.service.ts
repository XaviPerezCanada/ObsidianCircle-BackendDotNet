// services/article.service.ts
import { api } from '@/src/lib/api'

export type Article = {
  id?: number
  title: string
  content: string
  tags: string
  author: string
  date: string
  players: string
  createdAt?: string
  updatedAt?: string
}

export type CreateArticleRequest = Omit<Article, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateArticleRequest = Partial<CreateArticleRequest>

export const articleService = {
  getAll: async () => {
    return await api.get<Article[]>('/articles')
  },
  getById: async (id: number) => {
    return await api.get<Article>(`/articles/${id}`)
  },
  create: async (data: CreateArticleRequest) => {
    return await api.post<Article>('/articles', data)
  },
  update: async (id: number, data: UpdateArticleRequest) => {
    return await api.put<Article>(`/articles/${id}`, data)
  },
  delete: async (id: number) => {
    return await api.delete(`/articles/${id}`)
  },
}
