import { Dispute, DisputeStatus, UpdateDispute } from "../../lib/internal/disputes"

export const dispute1: Dispute = {
  id: "dp_xyz",
  amount: 100,
  currency: "usd",
  paymentId: "py_xyz",
  reason: "fraudulent",
  status: DisputeStatus.Won,
  metadata: {},
  createdAt: "2021-01-01T12:00:00Z",
  updatedAt: "2021-01-01T12:00:00Z"
}

export const dispute2: Dispute = {
  id: "dp_abc",
  amount: 100,
  currency: "usd",
  paymentId: "py_abc",
  reason: "fraudulent",
  status: DisputeStatus.Lost,
  metadata: {},
  createdAt: "2021-01-01T12:00:00Z",
  updatedAt: "2021-01-01T12:00:00Z"
}

export const updateDispute: UpdateDispute = {
  metadata: { extra: "info" }
}
