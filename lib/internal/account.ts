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

/**
 * @deprecated seller account has been deprecated, please use sub account
 */
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

export interface SubAccount {
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

/**
 * @deprecated seller account has been deprecated, please use sub account
 */
export interface SellerAccountApi {
  createSellerAccount(accountName: string): Promise<ApiResponse<SellerAccount>>;
  listSellerAccounts(
    status?: AccountStatus
  ): Promise<ApiResponse<SellerAccount[]>>;
  getSellerAccount(id: string): Promise<ApiResponse<SellerAccount>>;
}

export interface SubAccountApi {
  createSubAccount(accountName: string): Promise<ApiResponse<SubAccount>>;
  listSubAccounts(
    status?: AccountStatus
  ): Promise<ApiResponse<SubAccount[]>>;
  getSubAccount(id: string): Promise<ApiResponse<SubAccount>>;
}

/**
 * @deprecated seller account has been deprecated, please use sub account
 */
export const createSellerAccount = (
  token: string,
  accountName: string
): Promise<ApiResponse<SellerAccount>> => {
  console.warn("[DEPRECATED] seller account has been deprecated, please use sub account");
  const payload: { name: string } = { name: accountName };

  return new JustifiRequest(RequestMethod.Post, "/v1/seller_accounts")
    .withAuth(token)
    .withBody(payload)
    .execute<ApiResponse<SellerAccount>>();
};

export const createSubAccount = (
  token: string,
  accountName: string
): Promise<ApiResponse<SubAccount>> => {
  const payload: { name: string } = { name: accountName };

  return new JustifiRequest(RequestMethod.Post, "/v1/sub_accounts")
    .withAuth(token)
    .withBody(payload)
    .execute<ApiResponse<SubAccount>>();
};

/**
 * @deprecated seller account has been deprecated, please use sub account
 */
export const listSellerAccounts = (
  token: string,
  status?: AccountStatus
): Promise<ApiResponse<SellerAccount[]>> => {
  console.warn("[DEPRECATED] seller account has been deprecated, please use sub account");

  return new JustifiRequest(RequestMethod.Get, "/v1/seller_accounts")
    .withAuth(token)
    .withQueryParam("status", status || "")
    .execute<ApiResponse<SellerAccount[]>>();
};

export const listSubAccounts = (
  token: string,
  status?: AccountStatus
): Promise<ApiResponse<SubAccount[]>> => {
  return new JustifiRequest(RequestMethod.Get, "/v1/sub_accounts")
    .withAuth(token)
    .withQueryParam("status", status || "")
    .execute<ApiResponse<SubAccount[]>>();
};

/**
 * @deprecated seller account has been deprecated, please use sub account
 */
export const getSellerAccount = (
  token: string,
  id: string
): Promise<ApiResponse<SellerAccount>> => {
  console.warn("[DEPRECATED] seller account has been deprecated, please use sub account");
  const requestPath = `/v1/seller_accounts/${id}`;

  return new JustifiRequest(RequestMethod.Get, requestPath)
    .withAuth(token)
    .execute<ApiResponse<SellerAccount>>();
};

export const getSubAccount = (
  token: string,
  id: string
): Promise<ApiResponse<SubAccount>> => {
  const requestPath = `/v1/sub_accounts/${id}`;

  return new JustifiRequest(RequestMethod.Get, requestPath)
    .withAuth(token)
    .execute<ApiResponse<SubAccount>>();
};
