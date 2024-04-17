import { ApiResponse, JustifiRequest, RequestMethod } from "./http";

export interface Business {
  id: string,
  legalName: string
  platformAccountId: string
}

export interface BusinessApi {
  createBusiness(legalName: string): Promise<ApiResponse<Business>>
}

export const createBusiness = (
  token: string,
  legalName: string
): Promise<ApiResponse<Business>> => {
  const req = new JustifiRequest(RequestMethod.Post, "/v1/entities/business")
    .withAuth(token)
    .withBody({ legalName });

  return req.execute<ApiResponse<Business>>();
}
