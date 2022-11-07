import { toSnakeCase } from "./converter";
import { JustifiRequest, RequestMethod } from "./httpnew";

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
  Archive = "archived",
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

export interface SellerApi {
  createSellerAccount(accountName: string): Promise<SellerAccount>;
  listSellerAccounts(status?: AccountStatus): Promise<SellerAccount[]>;
  getSellerAccount(id: number): Promise<SellerAccount>;
}

export const createSellerAccount = (
  token: string,
  accountName: string
): Promise<SellerAccount> => {
  const payload: { name: string } = { name: accountName };

  return new JustifiRequest(RequestMethod.Post, "/v1/seller_accounts")
    .withAuth(token)
    .withBody(payload)
    .execute<SellerAccount>();
};

export const listSellerAccounts = (
  token: string,
  status?: AccountStatus
): Promise<SellerAccount[]> => {
  return new JustifiRequest(RequestMethod.Get, "/v1/seller_accounts")
    .withAuth(token)
    .withQueryParam("status", status || "")
    .execute<SellerAccount[]>();
};

export const getSellerAccount = (
  token: string,
  id: number
): Promise<SellerAccount> => {
  const requestPath = `/v1/seller_accounts/${id}`;

  return new JustifiRequest(RequestMethod.Get, requestPath)
    .withAuth(token)
    .execute<SellerAccount>();
};
