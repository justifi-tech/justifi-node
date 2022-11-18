import { Refund, RefundReason, RefundStatus } from "../../lib/internal/refund";

export const refund1: Refund = {
  id: "re_abc",
  paymentId: "py_abc",
  amount: 100,
  description: "customer canceled their order",
  reason: RefundReason.Duplicate,
  status: RefundStatus.Success,
  metadata: {},
  createdAt: "2021-01-01T12:00:00Z",
  updatedAt: "2021-01-01T12:00:00Z",
};

export const refund2: Refund = {
  id: "re_xyz",
  paymentId: "py_xyz",
  amount: 1000,
  description: "fraud detected",
  reason: RefundReason.Fradulent,
  status: RefundStatus.Pending,
  metadata: { incidentId: "abcxyz123" },
  createdAt: "2021-01-01T12:00:00Z",
  updatedAt: "2021-01-01T12:00:00Z",
};
