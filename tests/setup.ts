import Justifi from "../lib";
import { DEFAULT_HEADERS } from "../lib/internal/http";

export const getTestSetupData = () => {
  const mockBaseUrl = process.env.JUSTIFI_API_URL;
  if (!mockBaseUrl) {
    throw new Error("JUSTIFI_API_URL must be set for testing");
  }

  const credentials = {
    clientId: "some_client_id",
    clientSecret: "some_client_secret",
  };

  const client = Justifi.client().withCredentials(credentials);

  const token = { access_token: "some_access_token" };
  const authHeaders = {
    Authorization: `Bearer ${token}`,
    ...DEFAULT_HEADERS,
  };

  return {
    mockBaseUrl,
    credentials,
    client,
    token,
    defaultHeaders: DEFAULT_HEADERS,
    authHeaders,
  };
};
