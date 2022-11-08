import { ApiResponse, JustifiRequest, RequestMethod } from "./http";
import { CreateCard, Payment, PaymentMethod, PaymentMethods } from "./payment";

export enum PaymentIntentStatus {
  RequiresPaymentMethod = "requires_payment_method",
  Pending = "pending",
  RequiresCapture = "requires_capture",
  Canceled = "Canceled",
  Succeeded = "Succeeded",
}

export interface PaymentIntent {
  id: string;
  accountId: string;
  ammount: number;
  currency: string;
  description: string;
  metadata: any;
  paymentMethod: PaymentMethods;
  status: PaymentIntentStatus;
  createdAt: string;
  updatedAt: string;
}

export type PaymentMethodUnion = { card: CreateCard } | { token: string };

export interface PaymentIntentCreatePayload {
  amount: number;
  currency: string;
  description?: string;
  metadata?: any;
  paymentMethod?: PaymentMethodUnion;
}

export interface PaymentIntentUpdatePayload {
  description?: string;
  metadata?: any;
  paymentMethod: PaymentMethodUnion;
}

export interface PaymentIntentApi {
  createPaymentIntent(
    idempotencyKey: string,
    payload: PaymentIntentCreatePayload,
    sellerAccountId?: string
  ): Promise<ApiResponse<PaymentIntent>>;

  listPaymentIntents(
    sellerAccountId?: string
  ): Promise<ApiResponse<PaymentIntent[]>>;

  getPaymentIntent(id: string): Promise<ApiResponse<PaymentIntent>>;

  updatePaymentIntent(
    id: string,
    idempotencyKey: string,
    payload: PaymentIntentUpdatePayload
  ): Promise<ApiResponse<PaymentIntent>>;

  capturePaymentIntent(
    id: string,
    idempotencyKey: string,
    payload: PaymentMethodUnion
  ): Promise<ApiResponse<PaymentIntent>>;

  listPaymentsForPaymentIntent(id: string): Promise<ApiResponse<Payment>>;
}

export const createPaymentIntent = (
  token: string,
  idempotencyKey: string,
  payload: PaymentIntentCreatePayload,
  sellerAccountId?: string
): Promise<ApiResponse<PaymentIntent>> => {
  const req = new JustifiRequest(RequestMethod.Post, "/v1/payment_intents")
    .withAuth(token)
    .withIdempotencyKey(idempotencyKey)
    .withBody(payload);

  if (sellerAccountId) {
    req.withHeader("Seller-Account", sellerAccountId);
  }

  return req.execute<ApiResponse<PaymentIntent>>();
};

export const listPaymentIntents = (
  token: string,
  sellerAccountId?: string
): Promise<ApiResponse<PaymentIntent[]>> => {
  const req = new JustifiRequest(
    RequestMethod.Get,
    "/v1/payment_intents"
  ).withAuth(token);

  if (sellerAccountId) {
    req.withHeader("Seller-Account", sellerAccountId);
  }

  return req.execute<ApiResponse<PaymentIntent[]>>();
};

export const getPaymentIntent = (
  token: string,
  id: string
): Promise<ApiResponse<PaymentIntent>> => {
  return new JustifiRequest(RequestMethod.Get, `/v1/payment_intents/${id}`)
    .withAuth(token)
    .execute<ApiResponse<PaymentIntent>>();
};

export const updatePaymentIntent = (
  token: string,
  id: string,
  idempotencyKey: string,
  payload: PaymentIntentUpdatePayload
): Promise<ApiResponse<PaymentIntent>> => {
  return new JustifiRequest(RequestMethod.Patch, `/v1/payment_intents/${id}`)
    .withAuth(token)
    .withBody(payload)
    .withIdempotencyKey(idempotencyKey)
    .execute<ApiResponse<PaymentIntent>>();
};

export const capturePaymentIntent = (
  token: string,
  id: string,
  idempotencyKey: string,
  payload: PaymentMethodUnion
): Promise<ApiResponse<PaymentIntent>> => {
  return new JustifiRequest(
    RequestMethod.Post,
    `/v1/payment_intents/${id}/capture`
  )
    .withAuth(token)
    .withIdempotencyKey(idempotencyKey)
    .withBody(payload)
    .execute<ApiResponse<PaymentIntent>>();
};

export const listPaymentsForPaymentIntent = (
  token: string,
  id: string
): Promise<ApiResponse<Payment>> => {
  return new JustifiRequest(
    RequestMethod.Get,
    `/v1/payment_intents/${id}/payments`
  )
    .withAuth(token)
    .execute<ApiResponse<Payment>>();
};
