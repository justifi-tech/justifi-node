import { ApiResponse, JustifiRequest, RequestMethod } from "./http"

export enum ProductCategory {
  Payment = "payment",
  Credit = "credit",
  Lending = "lending",
  Insurance = "insurance"
}

export interface ProvisionProductPayload {
  newAccountName: string,
  businessId: string,
  productCategory: ProductCategory
}

export interface ProvisionProductResponse {
  accountType: string,
  subAccountId: string,
  platformAccountId: string,
  payload: object
}

export interface ProvisioningApi {
  provisionProduct(
    payload: ProvisionProductPayload
  ): Promise<ApiResponse<ProvisionProductResponse>>;
}

export const provisionProduct = (
  token: string,
  payload: ProvisionProductPayload
): Promise<ApiResponse<ProvisionProductResponse>> => {
  const req = new JustifiRequest(RequestMethod.Post, "/v1/entities/provisioning")
    .withAuth(token)
    .withBody(payload);

  return req.execute<ApiResponse<ProvisionProductResponse>>();
}
