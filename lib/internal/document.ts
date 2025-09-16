import { ApiResponse, JustifiRequest, RequestMethod } from "./http";

export interface EntityDocument {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  documentType: string;
  status: string;
  uploadedAt: string;
  url?: string;
  metadata?: Record<string, any>;
}

export interface CreateEntityDocumentPayload {
  fileName: string;
  fileType: string;
  documentType: string;
  fileData: string; // Base64 encoded file data
  metadata?: Record<string, any>;
}

export interface EntityDocumentListFilters {
  createdBefore?: string;
  createdAfter?: string;
  documentType?: string;
  fileType?: string;
  status?: string;
}

export interface EntityDocumentApi {
  createEntityDocument(payload: CreateEntityDocumentPayload): Promise<ApiResponse<EntityDocument>>;
  listEntityDocuments(filters?: EntityDocumentListFilters): Promise<ApiResponse<EntityDocument[]>>;
  getEntityDocument(id: string): Promise<ApiResponse<EntityDocument>>;
}

/**
 * Creates a new document.
 * 
 * @endpoint POST /v1/entities/document
 * @param token - Access token for authentication
 * @param payload - Document creation data
 * @returns Promise resolving to the created document
 */
export async function createEntityDocument(
  token: string,
  payload: CreateEntityDocumentPayload
): Promise<ApiResponse<EntityDocument>> {
  const request = new JustifiRequest(RequestMethod.Post, "/v1/entities/document")
    .withAuth(token)
    .withBody(payload);
  return request.execute<ApiResponse<EntityDocument>>();
}

/**
 * Lists all documents with optional filtering.
 * 
 * @endpoint GET /v1/entities/document
 * @param token - Access token for authentication
 * @param filters - Optional filters for pagination and search
 * @returns Promise resolving to array of documents
 */
export async function listEntityDocuments(
  token: string,
  filters?: EntityDocumentListFilters
): Promise<ApiResponse<EntityDocument[]>> {
  const request = new JustifiRequest(RequestMethod.Get, "/v1/entities/document")
    .withAuth(token);
  
  if (filters) {
    request.withQueryParams(filters);
  }
  
  return request.execute<ApiResponse<EntityDocument[]>>();
}

/**
 * Retrieves a document by its ID.
 * 
 * @endpoint GET /v1/entities/document/{id}
 * @param token - Access token for authentication
 * @param id - The document ID to retrieve
 * @returns Promise resolving to the document details
 */
export async function getEntityDocument(
  token: string,
  id: string
): Promise<ApiResponse<EntityDocument>> {
  const request = new JustifiRequest(RequestMethod.Get, `/v1/entities/document/${id}`)
    .withAuth(token);
  return request.execute<ApiResponse<EntityDocument>>();
}