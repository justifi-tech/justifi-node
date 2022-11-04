import { makeRequest, RequestMethod } from "./http";

export interface Credential {
  clientId: string;
  clientSecret: string;
}

export interface TokenRequest {
  client_id: string;
  client_secret: string;
}
export interface AccessToken {
  accessToken: string;
}

export const getAccessToken = (credential: Credential) => {
  return makeRequest<AccessToken>(
    RequestMethod.Post,
    "/oauth/token",
    {},
    credential
  );
};
