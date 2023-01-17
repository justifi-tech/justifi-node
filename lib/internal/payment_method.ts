import { ApiResponse, JustifiRequest, RequestMethod } from "./http";

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

export interface PaymentMethodCard {
  card: PaymentMethod;
  customerId: string;
  signature: string;
}

export interface PaymentMethodBankAccount {
  bankAccount: PaymentMethod;
  customerId: string;
  signature: string;
}

export type PaymentMethods = PaymentMethodCard | PaymentMethodBankAccount;

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
  brand?: string;
  metadata?: any;
}

export interface UpdateCard {
  month?: string;
  year?: string;
  addressLine1?: string;
  addressLine2?: string;
  addressCity?: string;
  addressState?: string;
  addressPostalCode?: string;
  addressCountry?: string;
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

export interface UpdateBankAccount {
  metadata: any;
}

export type PaymentMethodUnion =
  | { bankAccount: CreateBankAccount }
  | { card: CreateCard }
  | { token: string };

export interface CreatePaymentMethod {
  paymentMethod: { card: CreateCard } | { bankAccount: CreateBankAccount },
  email?: string
}

export interface UpdatePaymentMethod {
  card?: UpdateCard,
  bankAccount?: UpdateBankAccount
}

export interface PaymentMethodApi {
  createPaymentMethod(payload: CreatePaymentMethod, idempotencyKey: string, sellerAccountId?: string): Promise<ApiResponse<PaymentMethods>>;
  listPaymentMethods(sellerAccountId?: string, customerId?: string): Promise<ApiResponse<PaymentMethods[]>>;
  getPaymentMethod(paymentMethodToken: string): Promise<ApiResponse<PaymentMethods>>;
  updatePaymentMethod(payload: UpdatePaymentMethod, paymentMethodToken: string, idempotencyKey: string): Promise<ApiResponse<PaymentMethods>>;
}

export const createPaymentMethod = (token: string, payload: CreatePaymentMethod, idempotencyKey: string, sellerAccountId?: string): Promise<ApiResponse<PaymentMethods>> => {
  const req = new JustifiRequest(RequestMethod.Post, "/v1/payment_methods")
    .withAuth(token)
    .withIdempotencyKey(idempotencyKey)
    .withBody(payload);

  if (sellerAccountId) {
    req.withHeader("Seller-Account", sellerAccountId);
  }

  return req.execute<ApiResponse<PaymentMethods>>();
}

export const listPaymentMethods = (token: string, sellerAccountId?: string, customerId?: string): Promise<ApiResponse<PaymentMethods[]>> => {
  const req = new JustifiRequest(RequestMethod.Get, "/v1/payment_methods")
    .withAuth(token);

  if (sellerAccountId) {
    req.withHeader("Seller-Account", sellerAccountId);
  }

  if (customerId) {
    req.withQueryParam("customer_id", customerId);
  }

  return req.execute<ApiResponse<PaymentMethods[]>>();
}

export const getPaymentMethod = (token: string, paymentMethodToken: string): Promise<ApiResponse<PaymentMethods>> => {
  return new JustifiRequest(RequestMethod.Get, `/v1/payment_methods/${paymentMethodToken}`)
    .withAuth(token)
    .execute<ApiResponse<PaymentMethods>>();
}

export const updatePaymentMethod = (token: string, payload: UpdatePaymentMethod, paymentMethodToken: string, idempotencyKey: string): Promise<ApiResponse<PaymentMethods>> => {
  return new JustifiRequest(RequestMethod.Patch, `/v1/payment_methods/${paymentMethodToken}`)
    .withAuth(token)
    .withIdempotencyKey(idempotencyKey)
    .withBody(payload)
    .execute<ApiResponse<PaymentMethods>>();
}
