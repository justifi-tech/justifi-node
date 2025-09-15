import "jest";
import nock from "nock";
import { toSnakeCase } from "../../lib/internal/converter";
import { InternalError, NotFound, Unauthenticated, Unauthorized } from "../../lib/internal/error";
import { getTestSetupData } from "../setup";

describe("Error Handling Integration", () => {
  const {
    mockBaseUrl,
    credentials,
    client,
    token,
    defaultHeaders,
    authHeaders,
  } = getTestSetupData();

  afterEach(() => {
    nock.cleanAll();
    client.clearCache();
  });

  describe("Authentication Errors", () => {
    it("handles invalid credentials during auth", async () => {
      const authMock = nock(mockBaseUrl, { reqheaders: defaultHeaders })
        .post("/oauth/token", toSnakeCase(credentials))
        .once()
        .reply(401, { error: "Invalid credentials" });

      await expect(client.getPayment("pay_123")).rejects.toBeInstanceOf(Unauthenticated);
      expect(authMock.isDone()).toEqual(true);
    });

    it("handles expired/invalid token during API calls", async () => {
      // Successful auth
      const authMock = nock(mockBaseUrl, { reqheaders: defaultHeaders })
        .post("/oauth/token", toSnakeCase(credentials))
        .once()
        .reply(200, token);

      // API call with expired token
      const apiMock = nock(mockBaseUrl)
        .get("/v1/payments/pay_123", undefined, { reqheaders: authHeaders })
        .once()
        .reply(401, { error: "Token expired" });

      await expect(client.getPayment("pay_123")).rejects.toBeInstanceOf(Unauthenticated);
      expect(authMock.isDone()).toEqual(true);
      expect(apiMock.isDone()).toEqual(true);
    });
  });

  describe("Authorization Errors", () => {
    it("handles insufficient permissions", async () => {
      const authMock = nock(mockBaseUrl, { reqheaders: defaultHeaders })
        .post("/oauth/token", toSnakeCase(credentials))
        .once()
        .reply(200, token);

      const apiMock = nock(mockBaseUrl)
        .get("/v1/payments/pay_123", undefined, { reqheaders: authHeaders })
        .once()
        .reply(403, { error: "Insufficient permissions" });

      await expect(client.getPayment("pay_123")).rejects.toBeInstanceOf(Unauthorized);
      expect(authMock.isDone()).toEqual(true);
      expect(apiMock.isDone()).toEqual(true);
    });
  });

  describe("Resource Errors", () => {
    it("handles resource not found", async () => {
      const authMock = nock(mockBaseUrl, { reqheaders: defaultHeaders })
        .post("/oauth/token", toSnakeCase(credentials))
        .once()
        .reply(200, token);

      const apiMock = nock(mockBaseUrl)
        .get("/v1/payments/pay_nonexistent", undefined, { reqheaders: authHeaders })
        .once()
        .reply(404, { error: "Payment not found" });

      await expect(client.getPayment("pay_nonexistent")).rejects.toBeInstanceOf(NotFound);
      expect(authMock.isDone()).toEqual(true);
      expect(apiMock.isDone()).toEqual(true);
    });
  });

  describe("Server Errors", () => {
    it("handles internal server errors", async () => {
      const authMock = nock(mockBaseUrl, { reqheaders: defaultHeaders })
        .post("/oauth/token", toSnakeCase(credentials))
        .once()
        .reply(200, token);

      const apiMock = nock(mockBaseUrl)
        .get("/v1/payments/pay_123", undefined, { reqheaders: authHeaders })
        .once()
        .reply(500, { error: "Internal server error" });

      await expect(client.getPayment("pay_123")).rejects.toBeInstanceOf(InternalError);
      expect(authMock.isDone()).toEqual(true);
      expect(apiMock.isDone()).toEqual(true);
    });

    it("handles service unavailable", async () => {
      const authMock = nock(mockBaseUrl, { reqheaders: defaultHeaders })
        .post("/oauth/token", toSnakeCase(credentials))
        .once()
        .reply(200, token);

      const apiMock = nock(mockBaseUrl)
        .get("/v1/payments/pay_123", undefined, { reqheaders: authHeaders })
        .once()
        .reply(503, { error: "Service unavailable" });

      await expect(client.getPayment("pay_123")).rejects.toBeInstanceOf(InternalError);
      expect(authMock.isDone()).toEqual(true);
      expect(apiMock.isDone()).toEqual(true);
    });
  });

  describe("Network Errors", () => {
    it("handles connection errors during auth", async () => {
      const authMock = nock(mockBaseUrl, { reqheaders: defaultHeaders })
        .post("/oauth/token", toSnakeCase(credentials))
        .once()
        .replyWithError("Connection failed");

      await expect(client.getPayment("pay_123")).rejects.toBeInstanceOf(InternalError);
      expect(authMock.isDone()).toEqual(true);
    });

    it("handles timeout errors during API calls", async () => {
      const authMock = nock(mockBaseUrl, { reqheaders: defaultHeaders })
        .post("/oauth/token", toSnakeCase(credentials))
        .once()
        .reply(200, token);

      const apiMock = nock(mockBaseUrl)
        .get("/v1/payments/pay_123", undefined, { reqheaders: authHeaders })
        .once()
        .replyWithError("Request timeout");

      await expect(client.getPayment("pay_123")).rejects.toBeInstanceOf(InternalError);
      expect(authMock.isDone()).toEqual(true);
      expect(apiMock.isDone()).toEqual(true);
    });
  });

  describe("Malformed Response Handling", () => {
    it("handles invalid JSON responses", async () => {
      const authMock = nock(mockBaseUrl, { reqheaders: defaultHeaders })
        .post("/oauth/token", toSnakeCase(credentials))
        .once()
        .reply(200, token);

      const apiMock = nock(mockBaseUrl)
        .get("/v1/payments/pay_123", undefined, { reqheaders: authHeaders })
        .once()
        .reply(200, "invalid json{");

      await expect(client.getPayment("pay_123")).rejects.toBeInstanceOf(InternalError);
      expect(authMock.isDone()).toEqual(true);
      expect(apiMock.isDone()).toEqual(true);
    });
  });
});