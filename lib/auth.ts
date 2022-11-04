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

export interface Authenticator {
  getToken(): Promise<AccessToken>;
}

export const getAccessToken = (credential: Credential) => {
  return makeRequest<AccessToken>(
    RequestMethod.Post,
    "/oauth/token",
    {},
    {
      client_id: credential.clientId,
      client_secret: credential.clientSecret,
    }
  );
};
