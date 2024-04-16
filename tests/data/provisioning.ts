import { ProductCategory, ProvisionProductPayload, ProvisionProductResponse } from "../../lib/internal/provisioning";

export const provisionProduct: ProvisionProductResponse = {
  subAccountId: "acc_123",
  platformAccountId: "acc_abc",
  accountType: "test",
  payload: {
    some: { onboarding: "data" }
  }
}

export const provisionProductPayload: ProvisionProductPayload = {
  newAccountName: "acc_123",
  productCategory: ProductCategory.Payment,
  businessId: "biz_123"
}
