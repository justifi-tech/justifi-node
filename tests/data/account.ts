import { AccountStatus, AccountType, SubAccount } from "../../lib/internal/account";

export const subAccount1: SubAccount = {
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

export const subAccount2: SubAccount = {
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
