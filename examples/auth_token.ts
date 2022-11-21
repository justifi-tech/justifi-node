import Justifi from "../lib";
import { Credential } from "../lib/internal/auth";

export const getCredentials = (): Credential => {
  const clientId = process.env.CLIENT_ID;
  const clientSecret = process.env.CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Missing secret params");
  }

  return { clientId, clientSecret };
};

// Build the client with the credentials, this is only required once
const client = Justifi.client().withCredentials(getCredentials());

if (process.argv.length < 3) {
  console.log("Request name argument is required");
  process.exit(1);
}

switch (process.argv[2]) {
  case "getToken":
    client.getToken().then(console.log).catch(console.log);
    break;

  default:
    break;
}
