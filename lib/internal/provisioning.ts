import { ApiResponse, JustifiRequest, RequestMethod } from "./http"

export enum ProductCategory {
  Payment = "payment",
  Credit = "credit",
  Lending = "lending",
  Insurance = "insurance"
}

export interface ProvisionProductPayload {
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

/**
 * Provisions a product for a business entity.
 * 
 * @endpoint POST /v1/entities/provisioning
 * @param token - Access token for authentication
 * @param payload - Product provisioning data
 * @returns Promise resolving to the provisioning response
 */
export async function provisionProduct(
  token: string,
  payload: ProvisionProductPayload
): Promise<ApiResponse<ProvisionProductResponse>> {
  const req = new JustifiRequest(RequestMethod.Post, "/v1/entities/provisioning")
    .withAuth(token)
    .withBody(payload);

  return req.execute<ApiResponse<ProvisionProductResponse>>();
}
