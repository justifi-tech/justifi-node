import { ApiResponse, JustifiRequest, RequestMethod } from "./http";
import { PaymentMethods, PaymentMethodUnion } from "./payment_method";
import { Refund, RefundReason } from "./refund";

export interface ApplicationFee {
  id: string;
  amount: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export enum PaymentCaptureStrategy {
  Manual = "manual",
  Automatic = "automatic",
}

export enum PaymentStatus {
  Succeeded = "succeeded",
  Failed = "failed",
  Pending = "pending",
  Authorized = "authorized",
  Refunded = "refunded",
  Disputed = "disputed",
}

export enum PaymentBalanceTxnType {
  Payment = "payment",
  PaymentFee = "payment_fee",
  Payout = "payout",
  Refund = "refund",
  FeeRefund = "fee_refund",
  Dispute = "dispute",
  DisputeFee = "dispute_fee",
  DisputeFeeRefund = "dispute_fee_refund",
  DisputeRefund = "dispute_refund",
}

export interface Payment {
  id: string;
  accountId: string;
  amount: number;
  amountDisputed: number;
  amountRefunded: number;
  amountRefundable: number;
  balance: number;
  feeAmount: number;
  captured: boolean;
  captureStrategy: PaymentCaptureStrategy;
  currency: string;
  description: string;
  disputed: boolean;
  disputes: any;
  errorCode: string;
  errorDescription: string;
  isTest: boolean;
  metadata: any;
  paymentIntentId: string;
  paymentMethod: PaymentMethods;
  applicationFee: ApplicationFee;
  refunded: boolean;
  status: PaymentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentBalanceTransaction {
  id: string;
  amount: number;
  balance: number;
  currency: string;
  financialTransactionId: string;
  paymentId: string;
  paymentBalanceTxnType: PaymentBalanceTxnType;
  sourceId: string;
  sourceType: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentPayload {
  amount: number;
  currency: string;
  captureStrategy: PaymentCaptureStrategy;
  email?: string;
  paymentMethod: PaymentMethodUnion;
  applicationFeeAmount?: number;
  description?: string;
  metadata?: any;
}

export interface UpdatePaymentPayload {
  description?: string;
  metadata?: any;
}

export interface RefundPaymentPayload {
  amount?: number;
  description?: string;
  reason?: RefundReason;
  metadata?: any;
}

export interface PaymentListFilters {
  createdBefore?: string;
  createdAfter?: string;
  paymentStatus?: PaymentStatus;
}

export interface PaymentApi {
  createPayment(
    idempotencyKey: string,
    payload: CreatePaymentPayload,
    subAccountId?: string
  ): Promise<ApiResponse<Payment>>;

  listPayments(
    filters?: PaymentListFilters,
    subAccountId?: string
  ): Promise<ApiResponse<Payment[]>>;

  getPayment(id: string): Promise<ApiResponse<Payment>>;

  updatePayment(
    idempotencyKey: string,
    id: string,
    payload: UpdatePaymentPayload
  ): Promise<ApiResponse<Payment>>;

  capturePayment(
    idempotencyKey: string,
    id: string
  ): Promise<ApiResponse<Payment>>;

  refundPayment(
    idempotencyKey: string,
    id: string,
    payload: RefundPaymentPayload
  ): Promise<ApiResponse<Refund>>;

  getBalanceTransactions(
    paymentId: string
  ): Promise<ApiResponse<PaymentBalanceTransaction[]>>;
}

export const createPayment = (
  token: string,
  idempotencyKey: string,
  payload: CreatePaymentPayload,
  subAccountId?: string
): Promise<ApiResponse<Payment>> => {
  const req = new JustifiRequest(RequestMethod.Post, "/v1/payments")
    .withAuth(token)
    .withIdempotencyKey(idempotencyKey)
    .withBody(payload);

  if (subAccountId) {
    req.withHeader("Sub-Account", subAccountId);
  }

  return req.execute<ApiResponse<Payment>>();
};

export const listPayments = (
  token: string,
  filters?: PaymentListFilters,
  subAccountId?: string
): Promise<ApiResponse<Payment[]>> => {
  const req = new JustifiRequest(RequestMethod.Get, "/v1/payments").withAuth(
    token
  );

  if (filters) {
    req.withQueryParams(filters);
  }

  if (subAccountId) {
    req.withHeader("Sub-Account", subAccountId);
  }

  return req.execute<ApiResponse<Payment[]>>();
};

export const getPayment = (
  token: string,
  id: string
): Promise<ApiResponse<Payment>> => {
  return new JustifiRequest(RequestMethod.Get, `/v1/payments/${id}`)
    .withAuth(token)
    .execute<ApiResponse<Payment>>();
};

export const updatePayment = (
  token: string,
  idempotencyKey: string,
  id: string,
  payload: UpdatePaymentPayload
): Promise<ApiResponse<Payment>> => {
  return new JustifiRequest(RequestMethod.Patch, `/v1/payments/${id}`)
    .withAuth(token)
    .withIdempotencyKey(idempotencyKey)
    .withBody(payload)
    .execute<ApiResponse<Payment>>();
};

export const capturePayment = (
  token: string,
  idempotencyKey: string,
  id: string
): Promise<ApiResponse<Payment>> => {
  return new JustifiRequest(RequestMethod.Post, `/v1/payments/${id}/capture`)
    .withAuth(token)
    .withIdempotencyKey(idempotencyKey)
    .execute<ApiResponse<Payment>>();
};

export const refundPayment = (
  token: string,
  idempotencyKey: string,
  id: string,
  payload: RefundPaymentPayload
): Promise<ApiResponse<Refund>> => {
  return new JustifiRequest(RequestMethod.Post, `/v1/payments/${id}/refunds`)
    .withAuth(token)
    .withIdempotencyKey(idempotencyKey)
    .withBody(payload)
    .execute<ApiResponse<Refund>>();
};

export const getBalanceTransactions = (
  token: string,
  paymentId: string
): Promise<ApiResponse<PaymentBalanceTransaction[]>> => {
  return new JustifiRequest(
    RequestMethod.Get,
    `/v1/payments/${paymentId}/payment_balance_transactions`
  )
    .withAuth(token)
    .execute<ApiResponse<PaymentBalanceTransaction[]>>();
};
