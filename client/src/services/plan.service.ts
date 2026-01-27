import { api } from '@/src/lib/api';

export type Plan = {
  id: number;
  slug: string;
  nombre: string;
  precio_cent: number;
  moneda: 'EUR';
  periodo: 'MENSUAL' | 'ANUAL' | 'TRIMESTRAL';
  activo: number; // 0 o 1
  created_at: string;
}

export type CreatePlanRequest = {
  nombre: string;
  precio_cent: number;
  moneda?: 'EUR';
  periodo: 'MENSUAL' | 'ANUAL' | 'TRIMESTRAL';
  activo?: number;
}

export type UpdatePlanRequest = Partial<CreatePlanRequest>;

export const planService = {
  getAll: async (): Promise<Plan[]> => {
    const res = await api.get<Plan[]>('/planes');
    return res.data;
  },

  getBySlug: async (slug: string) => {
    return await api.get<Plan>(`/planes/${slug}`);
  },

  create: async (data: CreatePlanRequest) => {
    return await api.post<Plan>('/planes', data);
  },

  update: async (slug: string, data: UpdatePlanRequest) => {
    return await api.put<Plan>(`/planes/${slug}`, data);
  },

  delete: async (slug: string) => {
    return await api.delete(`/planes/${slug}`);
  },
}