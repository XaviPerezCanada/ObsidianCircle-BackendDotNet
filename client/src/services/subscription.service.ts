import { api } from '@/src/lib/api';

export type CreateCheckoutSessionRequest = {
  planSlug: string;
}

export type CreateCheckoutSessionResponse = {
  sessionId: string;
  url: string;
}

export type ConfirmPaymentResponse = {
  success: boolean;
  message: string;
}

export type Payment = {
  id: number;
  slug: string;
  usuario_id: number;
  suscripcion_id: number | null;
  plan_id: number | null;
  estado: string;
  importe_cent: number;
  moneda: string;
  order_id: string;
  stripe_session_id: string | null;
  stripe_customer_id: string | null;
  stripe_payment_intent_id: string | null;
  stripe_subscription_id: string | null;
  created_at: string;
  paid_at: string | null;
}

export const subscriptionService = {
  createCheckoutSession: async (data: CreateCheckoutSessionRequest) => {
    return await api.post<CreateCheckoutSessionResponse>('/subscriptions/create-checkout-session', data);
  },

  confirmPayment: async () => {
    return await api.post<ConfirmPaymentResponse>('/subscriptions/confirm-payment');
  },

  getMyPayments: async () => {
    return await api.get<Payment[]>('/subscriptions/my-payments');
  },

  getAllPayments: async () => {
    return await api.get<Payment[]>('/subscriptions/payments');
  },
}
