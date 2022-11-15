import { AccountStatus, AccountType, SellerAccount } from "../../lib/account";

export const sellerAccount1: SellerAccount = {
  id: "acc_abc",
  name: "The Shire ABC",
  accountType: AccountType.Test,
  status: AccountStatus.Enabled,
  currency: "usd",
  platformAccountId: "acc_abc",
  applicationFeeRates: [],
  processingReady: false,
  payoutReady: false,
  relatedAccounts: {
    liveAccountId: "acc_xyz",
    testAccountId: "acc_xyz",
  },
  createdAt: "2021-01-01T12:00:00Z",
  updatedAt: "2021-01-01T12:00:00Z",
};

export const sellerAccount2: SellerAccount = {
  id: "acc_xyz",
  name: "The Shire XYZ",
  accountType: AccountType.Test,
  status: AccountStatus.Enabled,
  currency: "usd",
  platformAccountId: "acc_xyz",
  applicationFeeRates: [],
  processingReady: false,
  payoutReady: false,
  relatedAccounts: {
    liveAccountId: "acc_xyz",
    testAccountId: "acc_xyz",
  },
  createdAt: "2021-01-01T12:00:00Z",
  updatedAt: "2021-01-01T12:00:00Z",
};
