import Justifi from "../lib";
import { getCredentials } from "./auth_token";

const client = Justifi.client().withCredentials(getCredentials());

if (process.argv.length < 3) {
  console.log("Request name argument is required");
  process.exit(1);
}

switch (process.argv[2]) {
  case "verifySignature":
    console.log(
      "Signature Valid?: ",
      client.verifySignature(
        { id: "<event_id>", your: "... event info ..." },
        "<timestamp>",
        "<secret_key>",
        "<received_signature>"
      )
    );
    break;

  default:
    break;
}
