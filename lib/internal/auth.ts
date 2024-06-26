import { JustifiRequest, RequestMethod } from "./http";

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

export const getAccessToken = async (
  credential: Credential
): Promise<AccessToken> => {
  const response = await new JustifiRequest(RequestMethod.Post, "/oauth/token")
    .withBody(credential)
    .execute<AccessToken>(false);

  return Promise.resolve(response);
};

export const getWebComponentToken = async (
  token: string,
  resources: string[]
): Promise<AccessToken> => {
  const response = await new JustifiRequest(RequestMethod.Post, "/v1/web_component_tokens")
    .withAuth(token)
    .withBody({resources: resources})
    .execute<AccessToken>(false);

  return Promise.resolve(response);
};
