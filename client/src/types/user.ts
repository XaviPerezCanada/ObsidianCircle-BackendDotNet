export type User = {
    id: string
    name: string
    email: string
    tipo: 'BASICO' | 'SOCIO' | 'ADMIN'
    status: 'ACTIVE' | 'INACTIVE'
    createdAt: string
    updatedAt: string
  }