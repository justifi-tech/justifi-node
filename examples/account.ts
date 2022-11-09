import { AccountStatus } from "../lib/account";
import { Justifi } from "../lib/client";
import { getCredentials } from "./auth_token";

const client = Justifi.client().withCredentials(getCredentials());

if (process.argv.length < 3) {
  console.log("Request name argument is required");
  process.exit(1);
}

switch (process.argv[2]) {
  case "createSellerAccount":
    client
      .createSellerAccount("justifi node sdk")
      .then(console.log)
      .catch(console.log);
    break;

  case "listSellerAccountsNoFilter":
    client.listSellerAccounts().then(console.log).catch(console.log);
    break;

  case "listSellerAccountsWithFilter":
    client
      .listSellerAccounts(AccountStatus.Archived)
      .then(console.log)
      .catch(console.log);
    break;

  case "getSellerAccount":
    client
      .getSellerAccount("<seller_account_id>")
      .then(console.log)
      .catch(console.log);
    break;

  default:
    break;
}
