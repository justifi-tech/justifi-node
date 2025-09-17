import { ApiResponse, JustifiRequest, RequestMethod } from "./http";

export interface EntityBankAccount {
  id: string;
  accountOwnerName: string;
  accountNumber: string;
  routingNumber: string;
  accountType: string;
  bankName: string;
  country: string;
  currency: string;
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
  account_type: string;
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
  createEntityBankAccount(
    account_owner_name: string,
    account_number: string,
    routing_number: string,
    account_type: string,
    bank_name: string,
    business_id: string,
    nickname?: string,
    metadata?: Record<string, string>
  ): Promise<ApiResponse<EntityBankAccount>>;
  listEntityBankAccounts(filters?: EntityBankAccountListFilters): Promise<ApiResponse<EntityBankAccount[]>>;
  getEntityBankAccount(id: string): Promise<ApiResponse<EntityBankAccount>>;
}

/**
 * Creates a new bank account.
 * 
 * @endpoint POST /v1/entities/bank_accounts
 * @param token - Access token for authentication
 * @param account_owner_name - Name of the account owner
 * @param account_number - Bank account number
 * @param routing_number - Bank routing number
 * @param account_type - Type of account (checking, savings, etc.)
 * @param bank_name - Name of the bank
 * @param business_id - Associated business ID
 * @param nickname - Optional nickname for the account
 * @param metadata - Optional metadata
 * @returns Promise resolving to the created bank account
 */
export async function createEntityBankAccount(
  token: string,
  account_owner_name: string,
  account_number: string,
  routing_number: string,
  account_type: string,
  bank_name: string,
  business_id: string,
  nickname?: string,
  metadata?: Record<string, string>
): Promise<ApiResponse<EntityBankAccount>> {
  const request = new JustifiRequest(RequestMethod.Post, "/v1/entities/bank_accounts")
    .withAuth(token)
    .withBody({
      account_owner_name,
      account_number,
      routing_number,
      account_type,
      bank_name,
      business_id,
      ...(nickname && { nickname }),
      ...(metadata && { metadata })
    });
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