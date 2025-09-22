import { ApiResponse, JustifiRequest, RequestMethod } from "./http";
import { Currency } from "./types";

export enum AccountType {
  Checking = "checking",
  Savings = "savings"
}


export interface EntityBankAccount {
  id: string;
  accountOwnerName: string;
  accountNumber: string;
  routingNumber: string;
  accountType: AccountType;
  bankName: string;
  country: string;
  currency: Currency;
  nickname?: string;
  metadata?: Record<string, string>;
  business_id?: string;
  platform_account_id?: string;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEntityBankAccountPayload {
  account_owner_name: string;
  account_number: string;
  routing_number: string;
  account_type: AccountType;
  bank_name: string;
  business_id: string;
  nickname?: string;
  metadata?: Record<string, string>;
}

export interface EntityBankAccountListFilters {
  business_id?: string;
  limit?: number;
  after_cursor?: string;
  before_cursor?: string;
}

export interface EntityBankAccountApi {
  createEntityBankAccount(payload: CreateEntityBankAccountPayload): Promise<ApiResponse<EntityBankAccount>>;
  listEntityBankAccounts(filters?: EntityBankAccountListFilters): Promise<ApiResponse<EntityBankAccount[]>>;
  getEntityBankAccount(id: string): Promise<ApiResponse<EntityBankAccount>>;
}

/**
 * Creates a new bank account.
 * 
 * @endpoint POST /v1/entities/bank_accounts
 * @param token - Access token for authentication
 * @param payload - Bank account creation data
 * @returns Promise resolving to the created bank account
 */
export async function createEntityBankAccount(
  token: string,
  payload: CreateEntityBankAccountPayload
): Promise<ApiResponse<EntityBankAccount>> {
  const request = new JustifiRequest(RequestMethod.Post, "/v1/entities/bank_accounts")
    .withAuth(token)
    .withBody(payload);
  return request.execute<ApiResponse<EntityBankAccount>>();
}

/**
 * Lists all bank accounts with optional filtering.
 * 
 * @endpoint GET /v1/entities/bank_accounts
 * @param token - Access token for authentication
 * @param filters - Optional filters for pagination and search
 * @returns Promise resolving to array of bank accounts
 */
export async function listEntityBankAccounts(
  token: string,
  filters?: EntityBankAccountListFilters
): Promise<ApiResponse<EntityBankAccount[]>> {
  const request = new JustifiRequest(RequestMethod.Get, "/v1/entities/bank_accounts")
    .withAuth(token);
  
  if (filters) {
    request.withQueryParams(filters);
  }
  
  return request.execute<ApiResponse<EntityBankAccount[]>>();
}

/**
 * Retrieves a bank account by its ID.
 * 
 * @endpoint GET /v1/entities/bank_accounts/{id}
 * @param token - Access token for authentication
 * @param id - The bank account ID to retrieve
 * @returns Promise resolving to the bank account details
 */
export async function getEntityBankAccount(
  token: string,
  id: string
): Promise<ApiResponse<EntityBankAccount>> {
  const request = new JustifiRequest(RequestMethod.Get, `/v1/entities/bank_accounts/${id}`)
    .withAuth(token);
  return request.execute<ApiResponse<EntityBankAccount>>();
}