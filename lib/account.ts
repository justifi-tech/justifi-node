import { toSnakeCase } from "./converter";

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
  return makeRequest<SellerAccount>(
    RequestMethod.Post,
    "/v1/seller_accounts",
    authHeader(token),
    JSON.stringify(toSnakeCase(payload))
  );
};

export const listSellerAccounts = (
  token: string,
  status?: AccountStatus
): Promise<SellerAccount[]> => {
  let requestPath = "/v1/seller_accounts";
  if (status) {
    requestPath = `${requestPath}?status=${status}`;
  }

  return makeRequest<SellerAccount[]>(
    RequestMethod.Get,
    requestPath,
    authHeader(token)
  );
};

export const getSellerAccount = (
  token: string,
  id: number
): Promise<SellerAccount> => {
  const requestPath = `/v1/seller_accounts/${id}`;

  return makeRequest<SellerAccount>(
    RequestMethod.Get,
    requestPath,
    authHeader(token)
  );
};
