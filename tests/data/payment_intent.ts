import {
  PaymentIntent,
  PaymentIntentCapturePayload,
  PaymentIntentCreatePayload,
  PaymentIntentStatus,
  PaymentIntentUpdatePayload,
} from "../../lib/internal/payment_intent";

export const paymentIntent1: PaymentIntent = {
  id: "pi_abc",
  accountId: "acc_abc",
  amount: 10000,
  currency: "usd",
  description: "my_order_abc",
  metadata: {},
  paymentMethod: {
    card: {
      id: "pm_123abc",
      acctLastFour: 4242,
      brand: "Visa",
      name: "Amanda Kessel",
      token: "pm_123abc",
      metadata: {},
      createdAt: "2021-01-01T12:00:00Z",
      updatedAt: "2021-01-01T12:00:00Z",
      addressLine1Check: "unchecked",
      addressPostalCodeCheck: "unchecked",
    },
    customerId: "cust_abc",
    signature: "4guAJNkVA3lRLVlanNVoBK",
  },
  status: PaymentIntentStatus.RequiresPaymentMethod,
  createdAt: "2021-01-01T12:00:00Z",
  updatedAt: "2021-01-01T12:00:00Z",
};

export const paymentIntent2: PaymentIntent = {
  id: "pi_xyz",
  accountId: "acc_xyz",
  amount: 500,
  currency: "usd",
  description: "my_order_xyz",
  metadata: {},
  paymentMethod: {
    bankAccount: {
      id: "pm_123xyz",
      acctLastFour: 4242,
      brand: "Visa",
      name: "John Kessel",
      token: "pm_123xyz",
      metadata: {},
      createdAt: "2021-01-01T12:00:00Z",
      updatedAt: "2021-01-01T12:00:00Z",
      addressLine1Check: "unchecked",
      addressPostalCodeCheck: "unchecked",
    },
    customerId: "cust_xyz",
    signature: "4guAJNkVA3lRLVlanNVoBK",
  },
  status: PaymentIntentStatus.RequiresPaymentMethod,
  createdAt: "2021-01-01T12:00:00Z",
  updatedAt: "2021-01-01T12:00:00Z",
};

export const createPaymentIntentPayload: PaymentIntentCreatePayload = {
  amount: 1000,
  currency: "usd",
  description: "something that costs 1000",
  metadata: { some: { extra_data: "here" } },
  paymentMethod: {
    card: {
      name: "my new card",
      number: "12345678901011",
      verification: "123",
      month: "12",
      year: "2040",
      addressPostalCode: "1234567890",
      brand: "the card brand",
    },
  },
};

export const updatePaymentIntentPayload: PaymentIntentUpdatePayload = {
  description: "new product description",
  metadata: { some_extra: "info" },
  paymentMethod: {
    card: {
      name: "my new card",
      number: "12345678901011",
      verification: "123",
      month: "12",
      year: "2040",
      addressPostalCode: "1234567890",
      brand: "the card brand",
    },
  },
};

export const capturePaymentIntentPayload: PaymentIntentCapturePayload = {
  paymentMethod: {
    card: {
      name: "my new card",
      number: "12345678901011",
      verification: "123",
      month: "12",
      year: "2040",
      addressPostalCode: "1234567890",
      brand: "the card brand",
    },
  },
};
