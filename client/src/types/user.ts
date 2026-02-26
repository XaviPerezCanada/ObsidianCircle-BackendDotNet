export type User = {
    id: string
    username: string
    email: string
    tipo: 'BASICO' | 'SOCIO' | 'ADMIN'
    status: 'ACTIVE' | 'INACTIVE'
    createdAt: string
    updatedAt: string
  }