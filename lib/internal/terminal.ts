import { ApiResponse, JustifiRequest, RequestMethod } from "./http";

export enum TerminalStatus {
  Active = "active",
  Inactive = "inactive",
  Offline = "offline",
  Maintenance = "maintenance",
}

export interface Terminal {
  id: string;
  name: string;
  serialNumber: string;
  model: string;
  status: TerminalStatus;
  locationId?: string;
  lastSeen?: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, any>;
}

export interface UpdateTerminalPayload {
  name?: string;
  locationId?: string;
  metadata?: Record<string, any>;
}

export interface TerminalOrder {
  id: string;
  quantity: number;
  model: string;
  status: string;
  shippingAddress?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTerminalOrderPayload {
  quantity: number;
  model: string;
  shippingAddress?: Record<string, any>;
}

export interface TerminalPayPayload {
  amount: number;
  currency: string;
  paymentMethodToken?: string;
}

export interface TerminalApi {
  listTerminals(): Promise<ApiResponse<Terminal[]>>;
  getTerminal(id: string): Promise<ApiResponse<Terminal>>;
  updateTerminal(id: string, payload: UpdateTerminalPayload): Promise<ApiResponse<Terminal>>;
  identifyTerminal(id: string): Promise<ApiResponse<void>>;
  getTerminalStatus(id: string): Promise<ApiResponse<{ status: TerminalStatus }>>;
  listTerminalOrders(): Promise<ApiResponse<TerminalOrder[]>>;
  createTerminalOrder(payload: CreateTerminalOrderPayload): Promise<ApiResponse<TerminalOrder>>;
  getTerminalOrder(id: string): Promise<ApiResponse<TerminalOrder>>;
  payViaTerminal(payload: TerminalPayPayload): Promise<ApiResponse<any>>;
}

/**
 * Lists all terminals.
 * 
 * @endpoint GET /v1/terminals
 * @param token - Access token for authentication
 * @returns Promise resolving to array of terminals
 */
export async function listTerminals(
  token: string
): Promise<ApiResponse<Terminal[]>> {
  const request = new JustifiRequest(RequestMethod.Get, "/v1/terminals")
    .withAuth(token);
  return request.execute<ApiResponse<Terminal[]>>();
}

/**
 * Retrieves a terminal by its ID.
 * 
 * @endpoint GET /v1/terminals/{id}
 * @param token - Access token for authentication
 * @param id - The terminal ID to retrieve
 * @returns Promise resolving to the terminal details
 */
export async function getTerminal(
  token: string,
  id: string
): Promise<ApiResponse<Terminal>> {
  const request = new JustifiRequest(RequestMethod.Get, `/v1/terminals/${id}`)
    .withAuth(token);
  return request.execute<ApiResponse<Terminal>>();
}

/**
 * Updates a terminal with new information.
 * 
 * @endpoint PATCH /v1/terminals/{id}
 * @param token - Access token for authentication
 * @param id - The terminal ID to update
 * @param payload - Terminal update data
 * @returns Promise resolving to the updated terminal
 */
export async function updateTerminal(
  token: string,
  id: string,
  payload: UpdateTerminalPayload
): Promise<ApiResponse<Terminal>> {
  const request = new JustifiRequest(RequestMethod.Patch, `/v1/terminals/${id}`)
    .withAuth(token)
    .withBody(payload);
  return request.execute<ApiResponse<Terminal>>();
}

/**
 * Identifies a terminal (causes it to display identification information).
 * 
 * @endpoint POST /v1/terminals/{id}/identify
 * @param token - Access token for authentication
 * @param id - The terminal ID to identify
 * @returns Promise resolving to void
 */
export async function identifyTerminal(
  token: string,
  id: string
): Promise<ApiResponse<void>> {
  const request = new JustifiRequest(RequestMethod.Post, `/v1/terminals/${id}/identify`)
    .withAuth(token);
  return request.execute<ApiResponse<void>>();
}

/**
 * Gets the status of a terminal.
 * 
 * @endpoint GET /v1/terminals/{id}/status
 * @param token - Access token for authentication
 * @param id - The terminal ID to get status for
 * @returns Promise resolving to the terminal status
 */
export async function getTerminalStatus(
  token: string,
  id: string
): Promise<ApiResponse<{ status: TerminalStatus }>> {
  const request = new JustifiRequest(RequestMethod.Get, `/v1/terminals/${id}/status`)
    .withAuth(token);
  return request.execute<ApiResponse<{ status: TerminalStatus }>>();
}

/**
 * Lists all terminal orders.
 * 
 * @endpoint GET /v1/terminals/orders
 * @param token - Access token for authentication
 * @returns Promise resolving to array of terminal orders
 */
export async function listTerminalOrders(
  token: string
): Promise<ApiResponse<TerminalOrder[]>> {
  const request = new JustifiRequest(RequestMethod.Get, "/v1/terminals/orders")
    .withAuth(token);
  return request.execute<ApiResponse<TerminalOrder[]>>();
}

/**
 * Creates a new terminal order.
 * 
 * @endpoint POST /v1/terminals/orders
 * @param token - Access token for authentication
 * @param payload - Terminal order creation data
 * @returns Promise resolving to the created terminal order
 */
export async function createTerminalOrder(
  token: string,
  payload: CreateTerminalOrderPayload
): Promise<ApiResponse<TerminalOrder>> {
  const request = new JustifiRequest(RequestMethod.Post, "/v1/terminals/orders")
    .withAuth(token)
    .withBody(payload);
  return request.execute<ApiResponse<TerminalOrder>>();
}

/**
 * Retrieves a terminal order by its ID.
 * 
 * @endpoint GET /v1/terminals/orders/{id}
 * @param token - Access token for authentication
 * @param id - The terminal order ID to retrieve
 * @returns Promise resolving to the terminal order details
 */
export async function getTerminalOrder(
  token: string,
  id: string
): Promise<ApiResponse<TerminalOrder>> {
  const request = new JustifiRequest(RequestMethod.Get, `/v1/terminals/orders/${id}`)
    .withAuth(token);
  return request.execute<ApiResponse<TerminalOrder>>();
}

/**
 * Processes a payment via terminal.
 * 
 * @endpoint POST /v1/terminals/pay
 * @param token - Access token for authentication
 * @param payload - Terminal payment data
 * @returns Promise resolving to the payment result
 */
export async function payViaTerminal(
  token: string,
  payload: TerminalPayPayload
): Promise<ApiResponse<any>> {
  const request = new JustifiRequest(RequestMethod.Post, "/v1/terminals/pay")
    .withAuth(token)
    .withBody(payload);
  return request.execute<ApiResponse<any>>();
}