import { ApiResponse, JustifiRequest, RequestMethod } from "./http";

export interface CreateCheckoutSessionResponse {
  checkoutSessionId: string
}

export interface CreateCheckoutSession {
  paymentIntentId: string,
  afterPaymentUrl: string,
  backUrl?: string
}

export interface CheckoutSessionApi {
  createCheckoutSession(payload: CreateCheckoutSession): Promise<ApiResponse<CreateCheckoutSessionResponse>>;
}

export const createCheckoutSession = (token: string, payload: CreateCheckoutSession): Promise<ApiResponse<CreateCheckoutSessionResponse>> => {
  return new JustifiRequest(RequestMethod.Post, "/v1/checkout_sessions")
    .withAuth(token)
    .withBody(payload)
    .execute<ApiResponse<CreateCheckoutSessionResponse>>();
}
