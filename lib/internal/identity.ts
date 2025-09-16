import { ApiResponse, JustifiRequest, RequestMethod } from "./http";

export interface EntityIdentity {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  ssn?: string;
  taxId?: string;
  verificationStatus: string;
  createdAt: string;
  updatedAt: string;
  address?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface CreateEntityIdentityPayload {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  ssn?: string;
  taxId?: string;
  address?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface UpdateEntityIdentityPayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  address?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface EntityIdentityListFilters {
  createdBefore?: string;
  createdAfter?: string;
  verificationStatus?: string;
  email?: string;
}

export interface EntityIdentityApi {
  createEntityIdentity(payload: CreateEntityIdentityPayload): Promise<ApiResponse<EntityIdentity>>;
  listEntityIdentities(filters?: EntityIdentityListFilters): Promise<ApiResponse<EntityIdentity[]>>;
  getEntityIdentity(id: string): Promise<ApiResponse<EntityIdentity>>;
  updateEntityIdentity(id: string, payload: UpdateEntityIdentityPayload): Promise<ApiResponse<EntityIdentity>>;
}

/**
 * Creates a new identity.
 * 
 * @endpoint POST /v1/entities/identity
 * @param token - Access token for authentication
 * @param payload - Identity creation data
 * @returns Promise resolving to the created identity
 */
export async function createEntityIdentity(
  token: string,
  payload: CreateEntityIdentityPayload
): Promise<ApiResponse<EntityIdentity>> {
  const request = new JustifiRequest(RequestMethod.Post, "/v1/entities/identity")
    .withAuth(token)
    .withBody(payload);
  return request.execute<ApiResponse<EntityIdentity>>();
}

/**
 * Lists all identities with optional filtering.
 * 
 * @endpoint GET /v1/entities/identity
 * @param token - Access token for authentication
 * @param filters - Optional filters for pagination and search
 * @returns Promise resolving to array of identities
 */
export async function listEntityIdentities(
  token: string,
  filters?: EntityIdentityListFilters
): Promise<ApiResponse<EntityIdentity[]>> {
  const request = new JustifiRequest(RequestMethod.Get, "/v1/entities/identity")
    .withAuth(token);
  
  if (filters) {
    request.withQueryParams(filters);
  }
  
  return request.execute<ApiResponse<EntityIdentity[]>>();
}

/**
 * Retrieves an identity by its ID.
 * 
 * @endpoint GET /v1/entities/identity/{id}
 * @param token - Access token for authentication
 * @param id - The identity ID to retrieve
 * @returns Promise resolving to the identity details
 */
export async function getEntityIdentity(
  token: string,
  id: string
): Promise<ApiResponse<EntityIdentity>> {
  const request = new JustifiRequest(RequestMethod.Get, `/v1/entities/identity/${id}`)
    .withAuth(token);
  return request.execute<ApiResponse<EntityIdentity>>();
}

/**
 * Updates an identity with new information.
 * 
 * @endpoint PATCH /v1/entities/identity/{id}
 * @param token - Access token for authentication
 * @param id - The identity ID to update
 * @param payload - Identity update data
 * @returns Promise resolving to the updated identity
 */
export async function updateEntityIdentity(
  token: string,
  id: string,
  payload: UpdateEntityIdentityPayload
): Promise<ApiResponse<EntityIdentity>> {
  const request = new JustifiRequest(RequestMethod.Patch, `/v1/entities/identity/${id}`)
    .withAuth(token)
    .withBody(payload);
  return request.execute<ApiResponse<EntityIdentity>>();
}