import { BalanceTransaction } from "../../lib/internal/balance_transactions";

export const balanceTransaction1: BalanceTransaction = {
  id: "bt_xyz",
  accountId: "acc_xyz",
  amount: 100000,
  availableOn: "2021-01-01T12:00:00Z",
  currency: "usd",
  description: "string",
  fee: 5000,
  financialTransactionId: "ft_xyz",
  net: 600,
  payoutId: "po_xyz",
  sourceId: "py_xyz",
  sourceType: "payment",
  txnType: "seller_payment",
  createdAt: "2021-01-01T12:00:00Z",
  updatedAt: "2021-01-01T12:00:00Z"
}

export const balanceTransaction2: BalanceTransaction = {
  id: "bt_abc",
  accountId: "acc_abc",
  amount: 100000,
  availableOn: "2021-01-01T12:00:00Z",
  currency: "usd",
  description: "string",
  fee: 5000,
  financialTransactionId: "ft_abc",
  net: 600,
  payoutId: "po_abc",
  sourceId: "py_abc",
  sourceType: "payment",
  txnType: "seller_payment",
  createdAt: "2021-01-01T12:00:00Z",
  updatedAt: "2021-01-01T12:00:00Z"
}
