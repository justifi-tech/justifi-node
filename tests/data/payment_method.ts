import { CreatePaymentMethod, PaymentMethods, UpdatePaymentMethod } from "../../lib/internal/payment_method";

export const createPaymentMethod: CreatePaymentMethod = {
  paymentMethod: {
    card: {
      name: "Amanda Kessel",
      number: "4242424242424242",
      verification: "123",
      month: "3",
      year: "2040",
      addressPostalCode: "55555",
      metadata: {
        "customer_id": "FRE4435"
      }
    }
  }
}
export const paymentMethod1: PaymentMethods = {
  card: {
    id: "pm_123xyz",
    acctLastFour: 4242,
    brand: "Visa",
    name: "Amanda Kessel",
    token: "pm_123xyz",
    metadata: {},
    createdAt: "2021-01-01T12:00:00Z",
    updatedAt: "2021-01-01T12:00:00Z",
    addressLine1Check: "unchecked",
    addressPostalCodeCheck: "unchecked"
  },
  customerId: "cust_xyz",
  signature: "4guAJNkVA3lRLVlanNVoBK"
}

export const paymentMethod2: PaymentMethods = {
  card: {
    id: "pm_123abc",
    acctLastFour: 4242,
    brand: "Mastercard",
    name: "Johnny Kessel",
    token: "pm_123abc",
    metadata: {},
    createdAt: "2021-01-01T12:00:00Z",
    updatedAt: "2021-01-01T12:00:00Z",
    addressLine1Check: "unchecked",
    addressPostalCodeCheck: "unchecked"
  },
  customerId: "cust_abc",
  signature: "4guAJNkVA3lRLVlanNVoBK"
}

export const updatePaymentMethod: UpdatePaymentMethod = {
  card: {
    month: "5",
    year: "2042",
    addressLine1: "123 Fake St",
    addressLine2: "Suite 101",
    addressCity: "Cityville",
    addressState: "MN",
    addressPostalCode: "55555",
    addressCountry: "US",
    metadata: {}
  },
  bankAccount: {
    metadata: {}
  }
}
