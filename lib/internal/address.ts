import { ApiResponse, JustifiRequest, RequestMethod } from "./http";

export interface EntityAddress {
  id: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, any>;
}

export interface CreateEntityAddressPayload {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  metadata?: Record<string, any>;
}

export interface UpdateEntityAddressPayload {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  metadata?: Record<string, any>;
}

export interface EntityAddressApi {
  createEntityAddress(payload: CreateEntityAddressPayload): Promise<ApiResponse<EntityAddress>>;
  listEntityAddresses(): Promise<ApiResponse<EntityAddress[]>>;
  getEntityAddress(id: string): Promise<ApiResponse<EntityAddress>>;
  updateEntityAddress(id: string, payload: UpdateEntityAddressPayload): Promise<ApiResponse<EntityAddress>>;
}

/**
 * Creates a new address.
 * 
 * @endpoint POST /v1/entities/address
 * @param token - Access token for authentication
 * @param payload - Address creation data
 * @returns Promise resolving to the created address
 */
export async function createEntityAddress(
  token: string,
  payload: CreateEntityAddressPayload
): Promise<ApiResponse<EntityAddress>> {
  const request = new JustifiRequest(RequestMethod.Post, "/v1/entities/address")
    .withAuth(token)
    .withBody(payload);
  return request.execute<ApiResponse<EntityAddress>>();
}

/**
 * Lists all addresses.
 * 
 * @endpoint GET /v1/entities/address
 * @param token - Access token for authentication
 * @returns Promise resolving to array of addresses
 */
export async function listEntityAddresses(
  token: string
): Promise<ApiResponse<EntityAddress[]>> {
  const request = new JustifiRequest(RequestMethod.Get, "/v1/entities/address")
    .withAuth(token);
  return request.execute<ApiResponse<EntityAddress[]>>();
}

/**
 * Retrieves an address by its ID.
 * 
 * @endpoint GET /v1/entities/address/{id}
 * @param token - Access token for authentication
 * @param id - The address ID to retrieve
 * @returns Promise resolving to the address details
 */
export async function getEntityAddress(
  token: string,
  id: string
): Promise<ApiResponse<EntityAddress>> {
  const request = new JustifiRequest(RequestMethod.Get, `/v1/entities/address/${id}`)
    .withAuth(token);
  return request.execute<ApiResponse<EntityAddress>>();
}

/**
 * Updates an address with new information.
 * 
 * @endpoint PATCH /v1/entities/address/{id}
 * @param token - Access token for authentication
 * @param id - The address ID to update
 * @param payload - Address update data
 * @returns Promise resolving to the updated address
 */
export async function updateEntityAddress(
  token: string,
  id: string,
  payload: UpdateEntityAddressPayload
): Promise<ApiResponse<EntityAddress>> {
  const request = new JustifiRequest(RequestMethod.Patch, `/v1/entities/address/${id}`)
    .withAuth(token)
    .withBody(payload);
  return request.execute<ApiResponse<EntityAddress>>();
}