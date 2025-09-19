import { ApiResponse, JustifiRequest, RequestMethod } from "./http";

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
  accountId: string;
  platformAccountId: string;
  paymentAmount: number;
  paymentCurrency: string;
  paymentDescription: string;
  paymentMethods: any;
  paymentMethodGroupId: string;
  status: CheckoutStatus;
  successfulPaymentId: string,
  paymentSettings: any,
  createdAt: string;
  updatedAt: string;
}

export interface CreateCheckoutPayload {
  amount: number;
  description: string;
  origin_url?: string;
  paymentMethodGroupId?: string;
  statement_descriptor?: string;
  application_fees?: any;
  payment?: any;
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
  listCheckouts(
    subAccountId?: string,
    paymentMode?: PaymentMode,
    status?: CheckoutStatus,
    paymentStatus?: string
  ): Promise<ApiResponse<Checkout[]>>;
  getCheckout(id: string): Promise<ApiResponse<Checkout>>;
  updateCheckout(
    id: string,
    amount?: number,
    description?: string,
    statementDescriptor?: string,
    applicationFees?: any
  ): Promise<ApiResponse<Checkout>>;
  createCheckout(
    payload: CreateCheckoutPayload,
    subAccountId?: string
  ): Promise<ApiResponse<Checkout>>;
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
 * @param subAccountId - Optional sub-account to scope the checkouts to
 * @param paymentMode - Optional payment mode filter
 * @param status - Optional checkout status filter
 * @param paymentStatus - Optional payment status filter
 * @returns Promise resolving to array of checkouts
 */
export function listCheckouts(
  token: string,
  subAccountId?: string,
  paymentMode?: PaymentMode,
  status?: CheckoutStatus,
  paymentStatus?: string
): Promise<ApiResponse<Checkout[]>> {
  const req = new JustifiRequest(RequestMethod.Get, "/v1/checkouts").withAuth(
    token
  );

  if (subAccountId) {
    req.withHeader("Sub-Account", subAccountId);
  }

  const queryParams: Record<string, string> = {};
  if (paymentMode) queryParams.payment_mode = paymentMode;
  if (status) queryParams.status = status;
  if (paymentStatus) queryParams.payment_status = paymentStatus;

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
 * @param amount - Optional new amount
 * @param description - Optional new description
 * @param statementDescriptor - Optional statement descriptor
 * @param applicationFees - Optional application fees
 * @returns Promise resolving to the updated checkout
 */
export function updateCheckout(
  token: string,
  id: string,
  amount?: number,
  description?: string,
  statementDescriptor?: string,
  applicationFees?: any
): Promise<ApiResponse<Checkout>> {
  const body: Record<string, any> = {};
  if (amount !== undefined) body.amount = amount;
  if (description !== undefined) body.description = description;
  if (statementDescriptor !== undefined) body.statement_descriptor = statementDescriptor;
  if (applicationFees !== undefined) body.application_fees = applicationFees;

  return new JustifiRequest(RequestMethod.Patch, `/v1/checkouts/${id}`)
    .withAuth(token)
    .withBody(body)
    .execute<ApiResponse<Checkout>>();
}

/**
 * Creates a new checkout.
 * 
 * @endpoint POST /v1/checkouts
 * @param token - Access token for authentication
 * @param payload - Checkout creation data
 * @param subAccountId - Optional sub-account to scope the checkout to
 * @returns Promise resolving to the created checkout
 */
export function createCheckout(
  token: string,
  payload: CreateCheckoutPayload,
  subAccountId?: string
): Promise<ApiResponse<Checkout>> {
  const req = new JustifiRequest(RequestMethod.Post, "/v1/checkouts")
    .withAuth(token)
    .withBody(payload);

  if (subAccountId) {
    req.withHeader("Sub-Account", subAccountId);
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

