import { ApiResponse, JustifiRequest, RequestMethod } from "./http";

export enum RefundReason {
  Duplicate = "duplicate",
  Fradulent = "fradulent",
  CustomerRequest = "customer_request",
}

export enum RefundStatus {
  Pending = "pending",
  Success = "success",
  Failed = "failed",
  Canceled = "canceled",
}

export interface Refund {
  id: string;
  paymentId: string;
  amount: number;
  description: string;
  reason: RefundReason;
  status: RefundStatus;
  metadata: any;
  createdAt: string;
  updatedAt: string;
}

export interface RefundApi {
  listRefunds(subAccountId?: string): Promise<ApiResponse<Refund[]>>;
  getRefund(id: string): Promise<ApiResponse<Refund>>;
  updateRefund(
    id: string,
    metadata: any,
    idempotencyKey: string
  ): Promise<ApiResponse<Refund>>;
}

export const listRefunds = (
  token: string,
  subAccountId?: string
): Promise<ApiResponse<Refund[]>> => {
  const req = new JustifiRequest(RequestMethod.Get, "/v1/refunds").withAuth(
    token
  );

  if (subAccountId) {
    req.withHeader("Sub-Account", subAccountId);
  }

  return req.execute<ApiResponse<Refund[]>>();
};

export const getRefund = (
  token: string,
  id: string
): Promise<ApiResponse<Refund>> => {
  return new JustifiRequest(RequestMethod.Get, `/v1/refunds/${id}`)
    .withAuth(token)
    .execute<ApiResponse<Refund>>();
};

export const updateRefund = (
  token: string,
  id: string,
  metadata: any,
  idempotencyKey: string
): Promise<ApiResponse<Refund>> => {
  return new JustifiRequest(RequestMethod.Patch, `/v1/refunds/${id}`)
    .withAuth(token)
    .withIdempotencyKey(idempotencyKey)
    .withBody({ metadata })
    .execute<ApiResponse<Refund>>();
};
