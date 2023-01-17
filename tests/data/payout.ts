import { Payout, PayoutStatus, UpdatePayout } from "../../lib/internal/payout"

export const payout1: Payout = {
  id: "po_xyz",
  accountId: "449e7a5c-69d3-4b8a-aaaf-5c9b713ebc65",
  amount: 100000,
  bankAccount: {
    id: "497f6eca-6276-4993-bfeb-53cbbbba6f08",
    fullName: "string",
    bankName: "string",
    accountNumberLast4: 1111,
    routingNumber: "string",
    country: "US",
    currency: "usd",
    nickname: "string",
    accountType: "checking"
  },
  currency: "usd",
  deliveryMethod: "standard",
  description: "string",
  depositsAt: "2021-01-01T12:00:00Z",
  feesTotal: 5000,
  refundsCount: 5,
  refundsTotal: 10000,
  paymentsCount: 50,
  paymentsTotal: 110000,
  payoutType: "ach cc",
  otherTotal: 100,
  status: PayoutStatus.Paid,
  metadata: { extra: "info" },
  createdAt: "2021-01-01T12:00:00Z",
  updatedAt: "2021-01-01T12:00:00Z"
}

export const payout2: Payout = {
  id: "po_abc",
  accountId: "449e7a5c-66d3-4b8a-abvf-5c9b722ebc65",
  amount: 1000,
  bankAccount: {
    id: "497f6eca-6276-4993-bfeb-53ccccca6f08",
    fullName: "string",
    bankName: "string",
    accountNumberLast4: 1111,
    routingNumber: "string",
    country: "US",
    currency: "usd",
    nickname: "string",
    accountType: "checking"
  },
  currency: "usd",
  deliveryMethod: "standard",
  description: "string",
  depositsAt: "2021-01-01T12:00:00Z",
  feesTotal: 5000,
  refundsCount: 5,
  refundsTotal: 10000,
  paymentsCount: 50,
  paymentsTotal: 110000,
  payoutType: "ach cc",
  otherTotal: 100,
  status: PayoutStatus.Paid,
  metadata: { extra: "info" },
  createdAt: "2021-01-01T12:00:00Z",
  updatedAt: "2021-01-01T12:00:00Z"
}

export const updatePayout: UpdatePayout = { metadata: { extra: "info" } };
