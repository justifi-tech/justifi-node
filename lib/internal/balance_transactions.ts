import { ApiResponse, JustifiRequest, RequestMethod } from "./http";

export interface BalanceTransaction {
  id: string;
  accountId: string;
  amount: number;
  availableOn: string;
  currency: string;
  description: string;
  fee: number;
  financialTransactionId: string;
  net: number;
  payoutId: string;
  sourceId: string;
  sourceType: string;
  txnType: string;
  createdAt: string;
  updatedAt: string;
}

export interface BalanceTransactionApi {
  listBalanceTransactions(payoutId: string): Promise<ApiResponse<BalanceTransaction[]>>;
  getBalanceTransaction(id: string): Promise<ApiResponse<BalanceTransaction>>;
}

export const listBalanceTransactions = (
  token: string,
  payoutId?: string
): Promise<ApiResponse<BalanceTransaction[]>> => {
  return new JustifiRequest(RequestMethod.Get, "/v1/balance_transactions")
    .withAuth(token)
    .withQueryParams({ payoutId })
    .execute<ApiResponse<BalanceTransaction[]>>();
}

export const getBalanceTransaction = (token: string, id: string): Promise<ApiResponse<BalanceTransaction>> => {
  return new JustifiRequest(RequestMethod.Get, `/v1/balance_transactions/${id}`)
    .withAuth(token)
    .execute<ApiResponse<BalanceTransaction>>();
}
