import { ApiResponse, JustifiRequest, RequestMethod } from "./http";

export enum ReportType {
  Payout = "payout",
  Proceeds = "proceeds",
  Transaction = "transaction",
  Dispute = "dispute",
}

export enum ReportFormat {
  CSV = "csv",
  PDF = "pdf",
  JSON = "json",
}

export enum ReportStatus {
  Pending = "pending",
  Processing = "processing",
  Completed = "completed",
  Failed = "failed",
}

export interface Report {
  id: string;
  type: ReportType;
  format: ReportFormat;
  status: ReportStatus;
  downloadUrl?: string;
  parameters: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface CreateReportPayload {
  type: ReportType;
  format?: ReportFormat;
  parameters?: Record<string, any>;
}

export interface ReportApi {
  createReport(payload: CreateReportPayload): Promise<ApiResponse<Report>>;
  listReports(): Promise<ApiResponse<Report[]>>;
  getReport(id: string): Promise<ApiResponse<Report>>;
  getPayoutReport(id: string): Promise<ApiResponse<string>>;
  getProceedsReport(id: string): Promise<ApiResponse<string>>;
}

/**
 * Creates a new report.
 * 
 * @endpoint POST /v1/reports
 * @param token - Access token for authentication
 * @param payload - Report creation data
 * @returns Promise resolving to the created report
 */
export async function createReport(
  token: string,
  payload: CreateReportPayload
): Promise<ApiResponse<Report>> {
  const request = new JustifiRequest(RequestMethod.Post, "/v1/reports")
    .withAuth(token)
    .withBody(payload);
  return request.execute<ApiResponse<Report>>();
}

/**
 * Lists all reports.
 * 
 * @endpoint GET /v1/reports
 * @param token - Access token for authentication
 * @returns Promise resolving to array of reports
 */
export async function listReports(
  token: string
): Promise<ApiResponse<Report[]>> {
  const request = new JustifiRequest(RequestMethod.Get, "/v1/reports")
    .withAuth(token);
  return request.execute<ApiResponse<Report[]>>();
}

/**
 * Retrieves a report by its ID.
 * 
 * @endpoint GET /v1/reports/{id}
 * @param token - Access token for authentication
 * @param id - The report ID to retrieve
 * @returns Promise resolving to the report details
 */
export async function getReport(
  token: string,
  id: string
): Promise<ApiResponse<Report>> {
  const request = new JustifiRequest(RequestMethod.Get, `/v1/reports/${id}`)
    .withAuth(token);
  return request.execute<ApiResponse<Report>>();
}

/**
 * Gets a payout CSV report.
 * 
 * @endpoint GET /v1/reports/payouts/{id}
 * @param token - Access token for authentication
 * @param id - The payout ID to get report for
 * @returns Promise resolving to the CSV report data
 */
export async function getPayoutReport(
  token: string,
  id: string
): Promise<ApiResponse<string>> {
  const request = new JustifiRequest(RequestMethod.Get, `/v1/reports/payouts/${id}`)
    .withAuth(token);
  return request.execute<ApiResponse<string>>();
}

/**
 * Gets a proceeds report.
 * 
 * @endpoint GET /v1/reports/proceeds/{id}
 * @param token - Access token for authentication
 * @param id - The proceeds ID to get report for
 * @returns Promise resolving to the proceeds report data
 */
export async function getProceedsReport(
  token: string,
  id: string
): Promise<ApiResponse<string>> {
  const request = new JustifiRequest(RequestMethod.Get, `/v1/reports/proceeds/${id}`)
    .withAuth(token);
  return request.execute<ApiResponse<string>>();
}