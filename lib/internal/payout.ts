import { ApiResponse, JustifiRequest, RequestMethod } from "./http";

export enum PayoutStatus {
  Paid = "paid",
  Failed = "failed",
  Pending = "pending",
  InTransit = "in_transit",
  Canceled = "canceled"
}

export interface PayoutBankAccount {
  id: string;
  fullName: string;
  bankName: string;
  accountNumberLast4: number;
  routingNumber: string;
  country: string;
  currency: string;
  nickname: string;
  accountType: string;
}

export interface Payout {
  id: string;
  accountId: string;
  amount: number;
  bankAccount: PayoutBankAccount;
  currency: string;
  deliveryMethod: string;
  description: string;
  depositsAt: string;
  feesTotal: number;
  refundsCount: number;
  refundsTotal: number;
  paymentsCount: number;
  paymentsTotal: number;
  payoutType: string;
  otherTotal: number;
  status: PayoutStatus;
  metadata: any;
  createdAt: string;
  updatedAt: string;
}

export interface UpdatePayout {
  metadata: any;
}

export interface PayoutFilter {
  createdBefore?: string;
  createdAfter?: string;
  depositsBefore?: string;
  depositsAfter?: string;
}

export interface PayoutApi {
  listPayouts(filters?: PayoutFilter): Promise<ApiResponse<Payout[]>>;
  getPayout(id: string): Promise<ApiResponse<Payout>>;
  updatePayout(id: string, idempotencyKey: string, payload: UpdatePayout): Promise<ApiResponse<Payout>>;
}

export const listPayouts = (token: string, filters?: PayoutFilter): Promise<ApiResponse<Payout[]>> => {
  return new JustifiRequest(RequestMethod.Get, "/v1/payouts")
    .withAuth(token)
    .withQueryParams(filters || {})
    .execute<ApiResponse<Payout[]>>();
}

export const getPayout = (token: string, id: string): Promise<ApiResponse<Payout>> => {
  return new JustifiRequest(RequestMethod.Get, `/v1/payouts/${id}`)
    .withAuth(token)
    .execute<ApiResponse<Payout>>();
}

export const updatePayout = (
  token: string,
  id: string,
  idempotencyKey: string,
  payload: UpdatePayout
): Promise<ApiResponse<Payout>> => {
  return new JustifiRequest(RequestMethod.Patch, `/v1/payouts/${id}`)
    .withAuth(token)
    .withIdempotencyKey(idempotencyKey)
    .withBody(payload)
    .execute<ApiResponse<Payout>>();
}
