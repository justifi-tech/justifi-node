import Justifi from "../lib";
import { Credential } from "../lib/auth";

const getCredentials = (): Credential => {
  const clientId = process.env.CLIENT_ID;
  const clientSecret = process.env.CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Missing secret params");
  }

  return { clientId, clientSecret };
};

// Build the client with the credentials, this is only required once
const client = Justifi.client().withCredentials(getCredentials());

client.getToken().then(console.log).catch(console.log);
