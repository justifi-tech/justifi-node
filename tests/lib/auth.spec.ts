import "jest";
import { toCamelCase, toSnakeCase } from "../../lib/internal/converter";
import { InternalError, NotFound } from "../../lib/internal/error";
import nock from "nock";
import { getTestSetupData } from "../setup";

describe("Auth", () => {
  const { mockBaseUrl, credentials, client, defaultHeaders } =
    getTestSetupData();

  afterEach(() => {
    nock.cleanAll();
    client.clearCache();
  });

  describe("when credentials are valid", () => {
    const token = { access_token: "some_access_token" };

    it("gets the access token", async () => {
      const serverMock = nock(mockBaseUrl, { reqheaders: defaultHeaders })
        .post("/oauth/token", toSnakeCase(credentials))
        .once()
        .reply(200, token);
      const justifiToken = await client.getToken();

      expect(justifiToken.accessToken).toEqual(token.access_token);
      expect(serverMock.isDone()).toEqual(true);
      expect(serverMock.pendingMocks()).toHaveLength(0);
    });
  });

  describe("when credentials are invalid", () => {
    const errorResponse = { error: "Resource not found" };

    it("responds with 404 not found", async () => {
      const serverMock = nock(mockBaseUrl, { reqheaders: defaultHeaders })
        .post("/oauth/token", toSnakeCase(credentials))
        .once()
        .reply(404, errorResponse);

      await expect(client.getToken()).rejects.toBeInstanceOf(NotFound);
      expect(serverMock.pendingMocks()).toHaveLength(0);
    });
  });

  describe("when api returns internal error", () => {
    const errorResponse = { error: "Resource not found" };

    it("responds with 500 internal server error", async () => {
      const serverMock = nock(mockBaseUrl, { reqheaders: defaultHeaders })
        .post("/oauth/token", toSnakeCase(credentials))
        .once()
        .reply(500, errorResponse);

      await expect(client.getToken()).rejects.toBeInstanceOf(InternalError);
      expect(serverMock.pendingMocks()).toHaveLength(0);
    });
  });

  describe("when calling getToken multiple times", () => {
    const token = { access_token: "some_access_token" };

    it("calls the api only once", async () => {
      const serverMock = nock(mockBaseUrl, { reqheaders: defaultHeaders })
        .post("/oauth/token", toSnakeCase(credentials))
        .once()
        .reply(200, token);

      const firstToken = await client.getToken();
      expect(firstToken.accessToken).toEqual(token.access_token);

      await expect(client.getToken()).resolves.toEqual(toCamelCase(token));
      expect(serverMock.pendingMocks()).toHaveLength(0);
    });
  });

  describe("when calling getWebComponentToken multiple times", () => {
    const wcToken = { access_token: "some_wc_access_token" };
    const token = "some_access_token";
    const checkoutId = "chc_xyz";
    const accountId = "acct_xyz";
    const resources = [`write:checkout:${checkoutId}`, `write:tokenize:${accountId}`]

    it("calls the api only once", async () => {
      const serverMock = nock(mockBaseUrl, { reqheaders: defaultHeaders })
        .post("/v1/web_component_tokens", toSnakeCase({ resources }))
        .once()
        .reply(200, wcToken);

      const firstToken = await client.getWCToken(token, checkoutId, accountId);
      expect(firstToken.accessToken).toEqual(wcToken.access_token);

      await expect(client.getWCToken(token, checkoutId, accountId)).resolves.toEqual(toCamelCase(wcToken));
      expect(serverMock.pendingMocks()).toHaveLength(0);
    });
  });
});
