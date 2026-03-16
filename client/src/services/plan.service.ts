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

function mapFromApi(input: any): Plan {
  return {
    id: input.id,
    slug: input.slug,
    nombre: input.nombre,
    precio_cent: input.precio_cent ?? input.precioCent ?? 0,
    moneda: 'EUR',
    periodo: (input.periodo ?? 'MENSUAL') as Plan['periodo'],
    activo: input.activo ? 1 : 0,
    created_at: input.created_at ?? new Date().toISOString(),
  };
}

export const planService = {
  /** Planes activos (para frontend público / pago) */
  getActive: async (): Promise<Plan[]> => {
    const res = await api.get<any[]>('/planes');
    return (res.data ?? []).map(mapFromApi);
  },

  /** Todos los planes (para panel admin) */
  getAll: async (): Promise<Plan[]> => {
    const res = await api.get<any[]>('/admin/plans');
    return (res.data ?? []).map(mapFromApi);
  },

  getBySlug: async (slug: string) => {
    const res = await api.get<any>(`/admin/plans/${encodeURIComponent(slug)}`);
    return mapFromApi(res.data);
  },

  /** Crear plan (solo admin). El backend genera slug si no se envía. */
  create: async (data: CreatePlanRequest): Promise<void> => {
    await api.post('/admin/plans', {
      nombre: data.nombre,
      slug: data.nombre, // el backend usará Slug.From(nombre) igualmente
      precioCent: data.precio_cent,
      periodo: data.periodo,
      activo: (data.activo ?? 1) === 1,
    });
  },

  /** Actualizar plan (solo admin) */
  update: async (id: number, data: UpdatePlanRequest): Promise<void> => {
    await api.put(`/admin/plans/${id}`, {
      nombre: data.nombre,
      slug: data.nombre,
      precioCent: data.precio_cent,
      periodo: data.periodo,
      activo: (data.activo ?? 1) === 1,
    });
  },

  delete: async (_slug: string): Promise<void> => {
    // (Opcional) podrías añadir DELETE en el backend y llamarlo aquí.
    // De momento dejamos un stub para evitar romper otros usos.
    return Promise.resolve();
  },
}