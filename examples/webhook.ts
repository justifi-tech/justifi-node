import Justifi from "../lib";
import { getCredentials } from "./auth_token";

const client = Justifi.client().withCredentials(getCredentials());

if (process.argv.length < 3) {
  console.log("Request name argument is required");
  process.exit(1);
}

switch (process.argv[2]) {
  case "verifySignature":
    client.verifySignature(
      {},
      "2022-11-09T22:51:53.616Z",
      "<your_secret_key>",
      "<received_signature>"
    );
    break;

  default:
    break;
}
