import { ApiResponse, JustifiRequest, RequestMethod } from "./http";

export enum AccountType {
  Live = "live",
  Test = "test",
}

export enum AccountStatus {
  Created = "created",
  Submitted = "submitted",
  InformationNeeded = "information_needed",
  Enabled = "enabled",
  Rejected = "rejected",
  Disabled = "disabled",
  Archived = "archived",
}

export enum RateType {
  Cc = "cc",
  Ach = "ach",
  Archived = "archived",
}

export interface ApplicationFeeRate {
  id: string;
  basisPointRate: number;
  rateType: string;
  currency: string;
  transactionFee: number;
  createdAt: string;
  updatedAt: string;
}

export interface RelatedAccounts {
  liveAccountId: string;
  testAccountId: string;
}

export interface SellerAccount {
  id: string;
  name: string;
  accountType: AccountType;
  status: AccountStatus;
  currency: string;
  platformAccountId: string;
  applicationFeeRates: ApplicationFeeRate[];
  processingReady: boolean;
  payoutReady: boolean;
  relatedAccounts: RelatedAccounts;
  createdAt: string;
  updatedAt: string;
}

export interface SellerAccountApi {
  createSellerAccount(accountName: string): Promise<SellerAccount>;
  listSellerAccounts(status?: AccountStatus): Promise<SellerAccount[]>;
  getSellerAccount(id: string): Promise<SellerAccount>;
}

export const createSellerAccount = (
  token: string,
  accountName: string
): Promise<ApiResponse<SellerAccount>> => {
  const payload: { name: string } = { name: accountName };

  return new JustifiRequest(RequestMethod.Post, "/v1/seller_accounts")
    .withAuth(token)
    .withBody(payload)
    .execute<ApiResponse<SellerAccount>>();
};

export const listSellerAccounts = (
  token: string,
  status?: AccountStatus
): Promise<ApiResponse<SellerAccount[]>> => {
  return new JustifiRequest(RequestMethod.Get, "/v1/seller_accounts")
    .withAuth(token)
    .withQueryParam("status", status || "")
    .execute<ApiResponse<SellerAccount[]>>();
};

export const getSellerAccount = (
  token: string,
  id: string
): Promise<ApiResponse<SellerAccount>> => {
  const requestPath = `/v1/seller_accounts/${id}`;

  return new JustifiRequest(RequestMethod.Get, requestPath)
    .withAuth(token)
    .execute<ApiResponse<SellerAccount>>();
};
