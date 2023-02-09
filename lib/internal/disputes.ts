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

export interface DisputeApi {
  listDisputes(subAccountId?: string): Promise<ApiResponse<Dispute>>;
  getDispute(id: string): Promise<ApiResponse<Dispute>>;
  updateDispute(id: string, idempotencyKey: string, payload: UpdateDispute): Promise<ApiResponse<Dispute>>;
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
