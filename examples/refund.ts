import Justifi from "../lib";
import { getCredentials } from "./auth_token";

const client = Justifi.client().withCredentials(getCredentials());

if (process.argv.length < 3) {
  console.log("Request name argument is required");
  process.exit(1);
}

switch (process.argv[2]) {
  case "listRefundsNoSubAccount":
    client.listRefunds().then(console.log).catch(console.log);
    break;

  case "listRefundsWithSubAccount":
    client
      .listRefunds("<sub_account_id>")
      .then(console.log)
      .catch(console.log);
    break;

  case "getRefund":
    client.getRefund("<refund_id>").then(console.log).catch(console.log);
    break;

  case "updateRefund":
    client
      .updateRefund(
        "<refund_id",
        { any: { data: "you want" } },
        "<idempotency_key>"
      )
      .then(console.log)
      .catch(console.log);
    break;

  default:
    break;
}
