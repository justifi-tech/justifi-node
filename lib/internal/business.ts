import { ApiResponse, JustifiRequest, RequestMethod } from "./http";

export interface Business {
  id: string,
  legalName: string
  platformAccountId: string
}

export interface EntityBusiness {
  id: string;
  legalName?: string;
  websiteUrl?: string;
  email?: string;
  phone?: string;
  doingBusinessAs?: string;
  businessType?: string;
  businessStructure?: string;
  classification?: string;
  industry?: string;
  mcc?: string;
  taxId?: string;
  dateOfIncorporation?: string;
  countryOfEstablishment?: string;
  platformAccountId: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, any>;
  additionalQuestions?: Record<string, any>;
  legalAddress?: Record<string, any>;
  representative?: Record<string, any>;
  owners?: Record<string, any>[];
}

export interface CreateEntityBusinessPayload {
  legalName?: string;
  websiteUrl?: string;
  email?: string;
  phone?: string;
  doingBusinessAs?: string;
  businessType?: string;
  businessStructure?: string;
  classification?: string;
  industry?: string;
  mcc?: string;
  taxId?: string;
  dateOfIncorporation?: string;
  countryOfEstablishment?: string;
  metadata?: Record<string, any>;
  additionalQuestions?: Record<string, any>;
  legalAddress?: Record<string, any>;
  representative?: Record<string, any>;
  owners?: Record<string, any>[];
}

export interface UpdateEntityBusinessPayload {
  legalName?: string;
  websiteUrl?: string;
  email?: string;
  phone?: string;
  doingBusinessAs?: string;
  businessType?: string;
  businessStructure?: string;
  classification?: string;
  industry?: string;
  mcc?: string;
  taxId?: string;
  dateOfIncorporation?: string;
  countryOfEstablishment?: string;
  metadata?: Record<string, any>;
  additionalQuestions?: Record<string, any>;
  legalAddress?: Record<string, any>;
  representative?: Record<string, any>;
  owners?: Record<string, any>[];
}

export interface EntityBusinessListFilters {
  createdBefore?: string;
  createdAfter?: string;
  businessType?: string;
  businessStructure?: string;
  industry?: string;
  classification?: string;
}

export interface BusinessApi {
  createBusiness(legalName: string): Promise<ApiResponse<Business>>
}

export interface EntityBusinessApi {
  createEntityBusiness(payload: CreateEntityBusinessPayload): Promise<ApiResponse<EntityBusiness>>;
  listEntityBusinesses(filters?: EntityBusinessListFilters): Promise<ApiResponse<EntityBusiness[]>>;
  getEntityBusiness(id: string): Promise<ApiResponse<EntityBusiness>>;
  updateEntityBusiness(id: string, payload: UpdateEntityBusinessPayload): Promise<ApiResponse<EntityBusiness>>;
}

/**
 * Creates a new business entity with full payload support.
 * 
 * @endpoint POST /v1/entities/business
 * @param token - Access token for authentication
 * @param payload - Business creation data
 * @returns Promise resolving to the created business
 */
export async function createEntityBusiness(
  token: string,
  payload: CreateEntityBusinessPayload
): Promise<ApiResponse<EntityBusiness>> {
  const request = new JustifiRequest(RequestMethod.Post, "/v1/entities/business")
    .withAuth(token)
    .withBody(payload);
  return request.execute<ApiResponse<EntityBusiness>>();
}

/**
 * Lists all businesses with optional filtering.
 * 
 * @endpoint GET /v1/entities/business
 * @param token - Access token for authentication
 * @param filters - Optional filters for pagination and search
 * @returns Promise resolving to array of businesses
 */
export async function listEntityBusinesses(
  token: string,
  filters?: EntityBusinessListFilters
): Promise<ApiResponse<EntityBusiness[]>> {
  const request = new JustifiRequest(RequestMethod.Get, "/v1/entities/business")
    .withAuth(token);
  
  if (filters) {
    request.withQueryParams(filters);
  }
  
  return request.execute<ApiResponse<EntityBusiness[]>>();
}

/**
 * Retrieves a business by its ID.
 * 
 * @endpoint GET /v1/entities/business/{id}
 * @param token - Access token for authentication
 * @param id - The business ID to retrieve
 * @returns Promise resolving to the business details
 */
export async function getEntityBusiness(
  token: string,
  id: string
): Promise<ApiResponse<EntityBusiness>> {
  const request = new JustifiRequest(RequestMethod.Get, `/v1/entities/business/${id}`)
    .withAuth(token);
  return request.execute<ApiResponse<EntityBusiness>>();
}

/**
 * Updates a business with new information.
 * 
 * @endpoint PATCH /v1/entities/business/{id}
 * @param token - Access token for authentication
 * @param id - The business ID to update
 * @param payload - Business update data
 * @returns Promise resolving to the updated business
 */
export async function updateEntityBusiness(
  token: string,
  id: string,
  payload: UpdateEntityBusinessPayload
): Promise<ApiResponse<EntityBusiness>> {
  const request = new JustifiRequest(RequestMethod.Patch, `/v1/entities/business/${id}`)
    .withAuth(token)
    .withBody(payload);
  return request.execute<ApiResponse<EntityBusiness>>();
}

/**
 * @deprecated Use createEntityBusiness instead for full parameter support
 */
export const createBusiness = (
  token: string,
  legalName: string
): Promise<ApiResponse<Business>> => {
  const req = new JustifiRequest(RequestMethod.Post, "/v1/entities/business")
    .withAuth(token)
    .withBody({ legalName });

  return req.execute<ApiResponse<Business>>();
}
