import { ApiResponse, JustifiRequest, RequestMethod } from "./http";

export enum CheckoutStatus {
  Completed = "completed",
  Created= "created",
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

export interface CheckoutApi {
  listCheckouts(sellerAccountId?: string): Promise<ApiResponse<Checkout[]>>;
  getCheckout(id: string): Promise<ApiResponse<Checkout>>;
  updateCheckout(
    id: string,
    amount: number,
    description: string
  ): Promise<ApiResponse<Checkout>>;
}

export const listCheckouts = (
  token: string,
  sellerAccountId?: string
): Promise<ApiResponse<Checkout[]>> => {
  const req = new JustifiRequest(RequestMethod.Get, "/v1/checkouts").withAuth(
    token
  );

  if (sellerAccountId) {
    req.withHeader("Seller-Account", sellerAccountId);
  }

  return req.execute<ApiResponse<Checkout[]>>();
};

export const getCheckout = (
  token: string,
  id: string
): Promise<ApiResponse<Checkout>> => {
  return new JustifiRequest(RequestMethod.Get, `/v1/checkouts/${id}`)
    .withAuth(token)
    .execute<ApiResponse<Checkout>>();
};

export const updateCheckout = (
  token: string,
  id: string,
  amount: number,
  description: string
): Promise<ApiResponse<Checkout>> => {
  return new JustifiRequest(RequestMethod.Patch, `/v1/checkouts/${id}`)
    .withAuth(token)
    .withBody({ amount, description })
    .execute<ApiResponse<Checkout>>();
};

