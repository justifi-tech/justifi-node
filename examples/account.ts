import Justifi from "../lib";
import { AccountStatus } from "../lib/internal/account";
import { getCredentials } from "./auth_token";

const client = Justifi.client().withCredentials(getCredentials());

if (process.argv.length < 3) {
  console.log("Request name argument is required");
  process.exit(1);
}

switch (process.argv[2]) {
  case "createSubAccount":
    client
      .createSubAccount("justifi node sdk")
      .then(console.log)
      .catch(console.log);
    break;

  case "listSubAccountsNoFilter":
    client.listSubAccounts().then(console.log).catch(console.log);
    break;

  case "listSubAccountsWithFilter":
    client
      .listSubAccounts(AccountStatus.Archived)
      .then(console.log)
      .catch(console.log);
    break;

  case "getSubAccount":
    client
      .getSubAccount("<sub_account_id>")
      .then(console.log)
      .catch(console.log);
    break;

  default:
    break;
}
