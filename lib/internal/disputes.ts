import { ApiResponse, JustifiRequest, RequestMethod } from "./http";

export enum DisputeStatus {
  NeedsResponse = "needs_response",
  UnderReview = "under_review",
  Won = "won",
  Lost = "lost"
}

export interface Dispute {
  id: string;
  amount: number;
  currency: string;
  paymentId: string;
  reason: string;
  status: DisputeStatus;
  metadata: any,
  createdAt: string;
  updatedAt: string;
}

export interface UpdateDispute {
  metadata: any
}

export interface DisputeEvidence {
  documents?: string[];
  notes?: string;
  customerCommunication?: string;
  shippingDocumentation?: string;
  duplicateChargeDocumentation?: string;
  productOrServiceDescription?: string;
  receiptOrRefundPolicy?: string;
}

export interface DisputeResponse {
  message: string;
  evidence?: DisputeEvidence;
}

export interface UpdateDisputeResponsePayload {
  message?: string;
  evidence?: DisputeEvidence;
}

export interface DisputeApi {
  listDisputes(subAccountId?: string): Promise<ApiResponse<Dispute>>;
  getDispute(id: string): Promise<ApiResponse<Dispute>>;
  updateDispute(id: string, idempotencyKey: string, payload: UpdateDispute): Promise<ApiResponse<Dispute>>;
  createDisputeEvidence(id: string, evidence: DisputeEvidence): Promise<ApiResponse<Dispute>>;
  submitDisputeResponse(id: string, response: DisputeResponse): Promise<ApiResponse<Dispute>>;
  updateDisputeResponse(id: string, payload: UpdateDisputeResponsePayload): Promise<ApiResponse<Dispute>>;
}

export const listDisputes = (token: string, subAccountId?: string): Promise<ApiResponse<Dispute>> => {
  const req = new JustifiRequest(RequestMethod.Get, "/v1/disputes").withAuth(token);

  if (subAccountId) {
    req.withHeader("Sub-Account", subAccountId)
  }

  return req.execute<ApiResponse<Dispute>>();
}

export const getDispute = (token: string, id: string): Promise<ApiResponse<Dispute>> => {
  return new JustifiRequest(RequestMethod.Get, `/v1/disputes/${id}`)
    .withAuth(token)
    .execute<ApiResponse<Dispute>>();
}

export const updateDispute = (
  token: string,
  id: string,
  idempotencyKey: string,
  payload: UpdateDispute,
): Promise<ApiResponse<Dispute>> => {
  return new JustifiRequest(RequestMethod.Patch, `/v1/disputes/${id}`)
    .withAuth(token)
    .withIdempotencyKey(idempotencyKey)
    .withBody(payload)
    .execute<ApiResponse<Dispute>>();
}

/**
 * Creates dispute evidence.
 * 
 * @endpoint PUT /v1/disputes/{id}/evidence
 * @param token - Access token for authentication
 * @param id - The dispute ID
 * @param evidence - Evidence data
 * @returns Promise resolving to the updated dispute
 */
export async function createDisputeEvidence(
  token: string,
  id: string,
  evidence: DisputeEvidence
): Promise<ApiResponse<Dispute>> {
  const request = new JustifiRequest(RequestMethod.Put, `/v1/disputes/${id}/evidence`)
    .withAuth(token)
    .withBody(evidence);
  return request.execute<ApiResponse<Dispute>>();
}

/**
 * Submits a dispute response.
 * 
 * @endpoint POST /v1/disputes/{id}/response
 * @param token - Access token for authentication
 * @param id - The dispute ID
 * @param response - Dispute response data
 * @returns Promise resolving to the updated dispute
 */
export async function submitDisputeResponse(
  token: string,
  id: string,
  response: DisputeResponse
): Promise<ApiResponse<Dispute>> {
  const request = new JustifiRequest(RequestMethod.Post, `/v1/disputes/${id}/response`)
    .withAuth(token)
    .withBody(response);
  return request.execute<ApiResponse<Dispute>>();
}

/**
 * Updates a dispute response.
 * 
 * @endpoint PATCH /v1/disputes/{id}/response
 * @param token - Access token for authentication
 * @param id - The dispute ID
 * @param payload - Updated dispute response data
 * @returns Promise resolving to the updated dispute
 */
export async function updateDisputeResponse(
  token: string,
  id: string,
  payload: UpdateDisputeResponsePayload
): Promise<ApiResponse<Dispute>> {
  const request = new JustifiRequest(RequestMethod.Patch, `/v1/disputes/${id}/response`)
    .withAuth(token)
    .withBody(payload);
  return request.execute<ApiResponse<Dispute>>();
}
