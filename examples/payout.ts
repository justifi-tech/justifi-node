import { randomUUID } from "crypto";
import Justifi from "../lib";
import { getCredentials } from "./auth_token";

const client = Justifi.client().withCredentials(getCredentials());

if (process.argv.length < 3) {
  console.log("Request name argument is required");
  process.exit(1);
}

switch (process.argv[2]) {
  case "listPayouts":
    client
      .listPayouts({
        createdBefore: "",
        createdAfter: "",
        depositsBefore: "",
        depositsAfter: ""
      })
      .then(console.log)
      .catch(console.log);
    break;

  case "getPayout":
    client.getPayout("<payout_id>").then(console.log).catch(console.log);
    break;

  case "updatePayout":
    client
      .updatePayout("<payout_id>", randomUUID(), { metadata: { extra: "info" } })
      .then(console.log)
      .catch(console.log);
    break;

  default:
    break;
}
