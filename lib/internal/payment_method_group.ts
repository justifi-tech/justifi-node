import { ApiResponse, JustifiRequest, RequestMethod } from "./http";

export interface PaymentMethodGroup {
  id: string;
  name: string;
  description?: string;
  paymentMethods: string[];
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, any>;
}

export interface CreatePaymentMethodGroupPayload {
  name: string;
  description?: string;
  paymentMethods?: string[];
  metadata?: Record<string, any>;
}

export interface UpdatePaymentMethodGroupPayload {
  name?: string;
  description?: string;
  paymentMethods?: string[];
  metadata?: Record<string, any>;
}

export interface PaymentMethodGroupApi {
  createPaymentMethodGroup(payload: CreatePaymentMethodGroupPayload): Promise<ApiResponse<PaymentMethodGroup>>;
  listPaymentMethodGroups(): Promise<ApiResponse<PaymentMethodGroup[]>>;
  getPaymentMethodGroup(id: string): Promise<ApiResponse<PaymentMethodGroup>>;
  updatePaymentMethodGroup(id: string, payload: UpdatePaymentMethodGroupPayload): Promise<ApiResponse<PaymentMethodGroup>>;
  removePaymentMethodFromGroup(groupId: string, paymentMethodId: string): Promise<ApiResponse<void>>;
}

/**
 * Creates a new payment method group.
 * 
 * @endpoint POST /v1/payment_method_groups
 * @param token - Access token for authentication
 * @param payload - Payment method group creation data
 * @returns Promise resolving to the created payment method group
 */
export async function createPaymentMethodGroup(
  token: string,
  payload: CreatePaymentMethodGroupPayload
): Promise<ApiResponse<PaymentMethodGroup>> {
  const request = new JustifiRequest(RequestMethod.Post, "/v1/payment_method_groups")
    .withAuth(token)
    .withBody(payload);
  return request.execute<ApiResponse<PaymentMethodGroup>>();
}

/**
 * Lists all payment method groups.
 * 
 * @endpoint GET /v1/payment_method_groups
 * @param token - Access token for authentication
 * @returns Promise resolving to array of payment method groups
 */
export async function listPaymentMethodGroups(
  token: string
): Promise<ApiResponse<PaymentMethodGroup[]>> {
  const request = new JustifiRequest(RequestMethod.Get, "/v1/payment_method_groups")
    .withAuth(token);
  return request.execute<ApiResponse<PaymentMethodGroup[]>>();
}

/**
 * Retrieves a payment method group by its ID.
 * 
 * @endpoint GET /v1/payment_method_groups/{id}
 * @param token - Access token for authentication
 * @param id - The payment method group ID to retrieve
 * @returns Promise resolving to the payment method group details
 */
export async function getPaymentMethodGroup(
  token: string,
  id: string
): Promise<ApiResponse<PaymentMethodGroup>> {
  const request = new JustifiRequest(RequestMethod.Get, `/v1/payment_method_groups/${id}`)
    .withAuth(token);
  return request.execute<ApiResponse<PaymentMethodGroup>>();
}

/**
 * Updates a payment method group with new information.
 * 
 * @endpoint PATCH /v1/payment_method_groups/{id}
 * @param token - Access token for authentication
 * @param id - The payment method group ID to update
 * @param payload - Payment method group update data
 * @returns Promise resolving to the updated payment method group
 */
export async function updatePaymentMethodGroup(
  token: string,
  id: string,
  payload: UpdatePaymentMethodGroupPayload
): Promise<ApiResponse<PaymentMethodGroup>> {
  const request = new JustifiRequest(RequestMethod.Patch, `/v1/payment_method_groups/${id}`)
    .withAuth(token)
    .withBody(payload);
  return request.execute<ApiResponse<PaymentMethodGroup>>();
}

/**
 * Removes a payment method from a payment method group.
 * 
 * @endpoint DELETE /v1/payment_method_groups/{id}/payment_methods/{payment_method_id}
 * @param token - Access token for authentication
 * @param groupId - The payment method group ID
 * @param paymentMethodId - The payment method ID to remove
 * @returns Promise resolving to void
 */
export async function removePaymentMethodFromGroup(
  token: string,
  groupId: string,
  paymentMethodId: string
): Promise<ApiResponse<void>> {
  const request = new JustifiRequest(RequestMethod.Delete, `/v1/payment_method_groups/${groupId}/payment_methods/${paymentMethodId}`)
    .withAuth(token);
  return request.execute<ApiResponse<void>>();
}