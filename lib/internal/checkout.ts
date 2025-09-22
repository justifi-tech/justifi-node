import { ApiResponse, JustifiRequest, RequestMethod } from "./http";
import { BaseListOptions, BaseOperationOptions } from "./types";

export enum CheckoutStatus {
  Completed = "completed",
  Created = "created",
  Attempted = "attempted",
  Expired = "expired",
}

export enum PaymentMode {
  Bnpl = "bnpl",
  Ecom = "ecom",
}

export interface Checkout {
  id: string;
  account_id: string;
  platform_account_id: string;
  payment_amount: number;
  payment_currency: string;
  payment_description: string;
  payment_methods: string[];
  payment_method_group_id: string;
  status: CheckoutStatus;
  successful_payment_id: string;
  payment_settings: {
    payment_method_group: {
      id: string;
      payment_methods: string[];
    };
  };
  created_at: string;
  updated_at: string;
}

export interface CheckoutApplicationFees {
  card?: {
    amount: number;
  };
  bank_account?: {
    amount: number;
  };
}

export interface CheckoutPayment {
  description?: string;
  metadata?: Record<string, any>;
  expedited?: boolean;
}

export interface CreateCheckoutPayload {
  amount: number;
  description: string;
  origin_url?: string;
  payment_method_group_id?: string;
  statement_descriptor?: string;
  application_fees?: CheckoutApplicationFees;
  payment?: CheckoutPayment;
}

export interface UpdateCheckoutPayload {
  amount?: number;
  description?: string;
  statement_descriptor?: string;
  application_fees?: CheckoutApplicationFees;
}

export interface CheckoutListParams extends BaseListOptions {
  filters?: {
    paymentMode?: PaymentMode;
    status?: CheckoutStatus;
    paymentStatus?: string;
  };
}

export interface CreateCheckoutParams extends BaseOperationOptions {
  payload: CreateCheckoutPayload;
}

export interface UpdateCheckoutParams {
  payload: UpdateCheckoutPayload;
}

export interface CompleteCheckoutPayload {
  paymentToken: string;
}

export interface RefundCheckoutPayload {
  amount?: number;
  currency?: string;
}

export enum CheckoutRefundStatus {
  Succeeded = "succeeded",
  Failed = "failed",
}

export interface CheckoutRefund {
  id: string;
  checkoutId: string;
  status: CheckoutRefundStatus;
  refundResponse: string;
  refundAmount: number;
  createdAt: string;
}

export interface CheckoutApi {
  listCheckouts(params?: CheckoutListParams): Promise<ApiResponse<Checkout[]>>;
  getCheckout(id: string): Promise<ApiResponse<Checkout>>;
  updateCheckout(id: string, params: UpdateCheckoutParams): Promise<ApiResponse<Checkout>>;
  createCheckout(params: CreateCheckoutParams): Promise<ApiResponse<Checkout>>;
  completeCheckout(
    id: string,
    idempotencyKey: string,
    payload: CompleteCheckoutPayload
  ): Promise<ApiResponse<Checkout>>;
  refundCheckout(
    id: string,
    idempotencyKey: string,
    payload?: RefundCheckoutPayload
  ): Promise<ApiResponse<CheckoutRefund>>;
}

/**
 * Lists all checkouts.
 * 
 * @endpoint GET /v1/checkouts
 * @param token - Access token for authentication
 * @param params - Optional list parameters including filters and pagination
 * @returns Promise resolving to array of checkouts
 */
export function listCheckouts(
  token: string,
  params?: CheckoutListParams
): Promise<ApiResponse<Checkout[]>> {
  const req = new JustifiRequest(RequestMethod.Get, "/v1/checkouts").withAuth(
    token
  );

  if (params?.subAccount?.subAccountId) {
    req.withHeader("Sub-Account", params.subAccount.subAccountId);
  }

  const queryParams: Record<string, string> = {};
  if (params?.filters?.paymentMode) queryParams.payment_mode = params.filters.paymentMode;
  if (params?.filters?.status) queryParams.status = params.filters.status;
  if (params?.filters?.paymentStatus) queryParams.payment_status = params.filters.paymentStatus;
  
  if (params?.pagination?.limit) queryParams.limit = params.pagination.limit.toString();
  if (params?.pagination?.after_cursor) queryParams.after_cursor = params.pagination.after_cursor;
  if (params?.pagination?.before_cursor) queryParams.before_cursor = params.pagination.before_cursor;

  if (Object.keys(queryParams).length > 0) {
    req.withQueryParams(queryParams);
  }

  return req.execute<ApiResponse<Checkout[]>>();
}

/**
 * Retrieves a checkout by its ID.
 * 
 * @endpoint GET /v1/checkouts/{id}
 * @param token - Access token for authentication
 * @param id - The checkout ID to retrieve
 * @returns Promise resolving to the checkout details
 */
export function getCheckout(
  token: string,
  id: string
): Promise<ApiResponse<Checkout>> {
  return new JustifiRequest(RequestMethod.Get, `/v1/checkouts/${id}`)
    .withAuth(token)
    .execute<ApiResponse<Checkout>>();
}

/**
 * Updates a checkout with new information.
 * 
 * @endpoint PATCH /v1/checkouts/{id}
 * @param token - Access token for authentication
 * @param id - The checkout ID to update
 * @param params - Update parameters containing payload
 * @returns Promise resolving to the updated checkout
 */
export function updateCheckout(
  token: string,
  id: string,
  params: UpdateCheckoutParams
): Promise<ApiResponse<Checkout>> {
  return new JustifiRequest(RequestMethod.Patch, `/v1/checkouts/${id}`)
    .withAuth(token)
    .withBody(params.payload)
    .execute<ApiResponse<Checkout>>();
}

/**
 * Creates a new checkout.
 * 
 * @endpoint POST /v1/checkouts
 * @param token - Access token for authentication
 * @param params - Checkout creation parameters including payload and sub-account
 * @returns Promise resolving to the created checkout
 */
export function createCheckout(
  token: string,
  params: CreateCheckoutParams
): Promise<ApiResponse<Checkout>> {
  const req = new JustifiRequest(RequestMethod.Post, "/v1/checkouts")
    .withAuth(token)
    .withBody(params.payload);

  if (params.subAccount?.subAccountId) {
    req.withHeader("Sub-Account", params.subAccount.subAccountId);
  }

  return req.execute<ApiResponse<Checkout>>();
}

/**
 * Completes a checkout by processing the payment.
 * 
 * @endpoint POST /v1/checkouts/{id}/complete
 * @param token - Access token for authentication
 * @param id - The checkout ID to complete
 * @param idempotencyKey - Unique key to prevent duplicate completions
 * @param payload - Checkout completion data
 * @returns Promise resolving to the completed checkout
 */
export function completeCheckout(
  token: string,
  id: string,
  idempotencyKey: string,
  payload: CompleteCheckoutPayload
): Promise<ApiResponse<Checkout>> {
  const req = new JustifiRequest(RequestMethod.Post, `/v1/checkouts/${id}/complete`)
                                 .withAuth(token)
                                 .withIdempotencyKey(idempotencyKey)
                                 .withBody(payload);

  return req.execute<ApiResponse<Checkout>>();
}

/**
 * Refunds a checkout.
 * 
 * @endpoint POST /v1/checkouts/{id}/refunds
 * @param token - Access token for authentication
 * @param id - The checkout ID to refund
 * @param idempotencyKey - Unique key to prevent duplicate refunds
 * @param payload - Optional refund data (amount and currency)
 * @returns Promise resolving to the checkout refund
 */
export async function refundCheckout(
  token: string,
  id: string,
  idempotencyKey: string,
  payload?: RefundCheckoutPayload
): Promise<ApiResponse<CheckoutRefund>> {
  const req = new JustifiRequest(RequestMethod.Post, `/v1/checkouts/${id}/refunds`)
    .withAuth(token)
    .withIdempotencyKey(idempotencyKey);

  if (payload) {
    req.withBody(payload);
  }

  return req.execute<ApiResponse<CheckoutRefund>>();
}

