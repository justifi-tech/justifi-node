import Justifi from "../lib";
import { getCredentials } from "./auth_token";

const client = Justifi.client().withCredentials(getCredentials());

if (process.argv.length < 3) {
  console.log("Request name argument is required");
  process.exit(1);
}

switch (process.argv[2]) {
  case "listBalanceTransactions":
    client
      .listBalanceTransactions()
      .then(console.log)
      .catch(console.log);
    break;

  case "getBalanceTransaction":
    client
      .getBalanceTransaction("<balance_transaction_id>")
      .then(console.log)
      .catch(console.log);
    break;

  default:
    break;
}
