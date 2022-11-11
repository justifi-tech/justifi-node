import { ApiResponse, JustifiRequest, RequestMethod } from "./http";
import { Refund, RefundReason } from "./refund";

export interface PaymentMethod {
  id: string;
  acctLastFour: number;
  brand: string;
  name: string;
  token: string;
  metadata: any;
  createdAt: string;
  updatedAt: string;
  addressLine1Check: string;
  addressPostalCodeCheck: string;
}

export interface PaymentMethods {
  card: PaymentMethod;
  bankAccount: PaymentMethod;
  customerId: string;
  signature: string;
}

export interface CreateCard {
  name: string;
  number: string;
  verification: string;
  month: string;
  year: string;
  addressLine1?: string;
  addressLine2?: string;
  addressCity?: string;
  addressState?: string;
  addressPostalCode: string;
  addressCountry?: string;
  brand: string;
  metadata?: any;
}

export enum BankAccountType {
  Checking = "checking",
  Savings = "savings",
}

export enum BankAccountOwnerType {
  Individual = "individual",
  Company = "company",
}

export interface CreateBankAccount {
  accountOwnerName: string;
  routingNumber: string;
  accountNumber: string;
  accountType: BankAccountType;
  accountOwnerType: BankAccountOwnerType;
  country: string;
  currency: string;
  metadata?: any;
}

export type PaymentMethodUnion =
  | { bankAccount: CreateBankAccount }
  | { card: CreateCard }
  | { token: string };

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

export interface BalanceTransaction {
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
    sellerAccountId?: string
  ): Promise<ApiResponse<Payment>>;

  listPayments(
    sellerAccountId?: string,
    filters?: PaymentListFilters
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
    id: string
  ): Promise<ApiResponse<BalanceTransaction[]>>;
}

export const createPayment = (
  token: string,
  idempotencyKey: string,
  payload: CreatePaymentPayload,
  sellerAccountId?: string
): Promise<ApiResponse<Payment>> => {
  const req = new JustifiRequest(RequestMethod.Post, "/v1/payments")
    .withAuth(token)
    .withIdempotencyKey(idempotencyKey)
    .withBody(payload);

  if (sellerAccountId) {
    req.withHeader("Seller-Account", sellerAccountId);
  }

  return req.execute<ApiResponse<Payment>>();
};

export const listPayments = (
  token: string,
  filters?: PaymentListFilters,
  sellerAccountId?: string
): Promise<ApiResponse<Payment[]>> => {
  const req = new JustifiRequest(RequestMethod.Get, "/v1/payments").withAuth(
    token
  );

  if (filters) {
    req.withQueryParams(filters);
  }

  if (sellerAccountId) {
    req.withHeader("Seller-Account", sellerAccountId);
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
  id: string
): Promise<ApiResponse<BalanceTransaction[]>> => {
  return new JustifiRequest(
    RequestMethod.Get,
    `/v1/payments/${id}/payment_balance_transactions`
  )
    .withAuth(token)
    .execute<ApiResponse<BalanceTransaction[]>>();
};
