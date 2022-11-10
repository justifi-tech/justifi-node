import "jest";
import Justifi from "../../lib";
import { toSnakeCase } from "../../lib/converter";
import { InternalError, NotFound } from "../../lib/error";
import { DEFAULT_HEADERS, RequestMethod } from "../../lib/http";
import { mockFetch } from "../mocks/http";

describe("Auth", () => {
  const mockBaseUrl = process.env.JUSTIFI_API_URL;
  if (!mockBaseUrl) {
    fail("JUSTIFI_API_URL must be set for testing");
  }
  const credentials = {
    clientId: "some_client_id",
    clientSecret: "some_client_secret",
  };

  const client = Justifi.client().withCredentials(credentials);

  let jestMock: jest.SpyInstance;
  afterEach(() => {
    jestMock.mockClear();
    client.clearCache();
  });

  describe("when credentials are valid", () => {
    const token = { access_token: "some_access_token" };

    it("gets the access token", async () => {
      jestMock = mockFetch(200, token);
      const justifiToken = await client.getToken();

      expect(jestMock).toHaveBeenCalledWith(
        new URL(`${mockBaseUrl}/oauth/token`),
        {
          method: RequestMethod.Post,
          headers: DEFAULT_HEADERS,
          body: JSON.stringify(toSnakeCase(credentials)),
        }
      );
      expect(justifiToken.accessToken).toEqual(token.access_token);
    });
  });

  describe("when credentials are invalid", () => {
    const errorResponse = { error: "Resource not found" };

    it("responds with 404 not found", async () => {
      jestMock = mockFetch(404, errorResponse);

      await expect(client.getToken()).rejects.toBeInstanceOf(NotFound);
      expect(jestMock).toHaveBeenCalledWith(
        new URL(`${mockBaseUrl}/oauth/token`),
        {
          method: RequestMethod.Post,
          headers: DEFAULT_HEADERS,
          body: JSON.stringify(toSnakeCase(credentials)),
        }
      );
    });
  });

  describe("when api returns internal error", () => {
    const errorResponse = { error: "Resource not found" };

    it("responds with 500 internal server error", async () => {
      jestMock = mockFetch(500, errorResponse);

      await expect(client.getToken()).rejects.toBeInstanceOf(InternalError);
      expect(jestMock).toHaveBeenCalledWith(
        new URL(`${mockBaseUrl}/oauth/token`),
        {
          method: RequestMethod.Post,
          headers: DEFAULT_HEADERS,
          body: JSON.stringify(toSnakeCase(credentials)),
        }
      );
    });
  });
});
