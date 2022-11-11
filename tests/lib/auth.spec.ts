import "jest";
import Justifi from "../../lib";
import { toSnakeCase } from "../../lib/converter";
import { InternalError, NotFound } from "../../lib/error";
import { DEFAULT_HEADERS } from "../../lib/http";
import nock from "nock";

describe("Auth", () => {
  const mockBaseUrl = process.env.JUSTIFI_API_URL;
  if (!mockBaseUrl) {
    throw new Error("JUSTIFI_API_URL must be set for testing");
  }
  const credentials = {
    clientId: "some_client_id",
    clientSecret: "some_client_secret",
  };

  const client = Justifi.client().withCredentials(credentials);

  afterEach(() => {
    nock.cleanAll();
    client.clearCache();
  });

  describe("when credentials are valid", () => {
    const token = { access_token: "some_access_token" };

    it("gets the access token", async () => {
      const serverMock = nock(mockBaseUrl, { reqheaders: DEFAULT_HEADERS })
        .post("/oauth/token", toSnakeCase(credentials))
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
      const serverMock = nock(mockBaseUrl, { reqheaders: DEFAULT_HEADERS })
        .post("/oauth/token", toSnakeCase(credentials))
        .reply(404, errorResponse);

      await expect(client.getToken()).rejects.toBeInstanceOf(NotFound);
      expect(serverMock.pendingMocks()).toHaveLength(0);
    });
  });

  describe("when api returns internal error", () => {
    const errorResponse = { error: "Resource not found" };

    it("responds with 500 internal server error", async () => {
      const serverMock = nock(mockBaseUrl, { reqheaders: DEFAULT_HEADERS })
        .post("/oauth/token", toSnakeCase(credentials))
        .reply(500, errorResponse);

      await expect(client.getToken()).rejects.toBeInstanceOf(InternalError);
      expect(serverMock.pendingMocks()).toHaveLength(0);
    });
  });
});
