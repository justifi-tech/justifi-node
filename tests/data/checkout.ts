import { Checkout, CheckoutStatus } from "../../lib/internal/checkout";

export const checkout1: Checkout = {
  id: "cho_xyz",
  accountId: "acc_xyz",
  platformAccountId: "acc_xyz",
  paymentAmount: 10000,
  paymentCurrency: "usd",
  paymentDescription: "my_order_xyz",
  paymentMethods: [ ],
  paymentMethodGroupId: "pmg_xyz",
  status: CheckoutStatus.Completed,
  successfulPaymentId: "py_xyz",
  paymentSettings: {},
  createdAt: "2024-01-01T12:00:00Z",
  updatedAt: "2024-01-01T12:00:00Z"
};

export const checkout2: Checkout = {
  id: "cho_xyz",
  accountId: "acc_xyz",
  platformAccountId: "acc_xyz",
  paymentAmount: 10000,
  paymentCurrency: "usd",
  paymentDescription: "my_order_xyz",
  paymentMethods: [ ],
  paymentMethodGroupId: "pmg_xyz",
  status: CheckoutStatus.Created,
  successfulPaymentId: "py_xyz",
  paymentSettings: {},
  createdAt: "2024-01-01T12:00:00Z",
  updatedAt: "2024-01-01T12:00:00Z"
};

