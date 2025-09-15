import "jest";
import nock from "nock";
import { toSnakeCase } from "../../lib/internal/converter";
import { withApiResponse } from "../data/http";
import { getTestSetupData } from "../setup";

describe("Client Integration", () => {
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

  describe("End-to-End API Flow", () => {
    it("completes authentication and API request successfully", async () => {
      // Mock OAuth token request
      const authMock = nock(mockBaseUrl, { reqheaders: defaultHeaders })
        .post("/oauth/token", toSnakeCase(credentials))
        .once()
        .reply(200, token);

      // Mock API request with authentication
      const mockPayment = {
        id: "pay_123",
        amount: 1000,
        currency: "USD",
        status: "succeeded"
      };

      const apiMock = nock(mockBaseUrl)
        .get("/v1/payments/pay_123", undefined, { reqheaders: authHeaders })
        .once()
        .reply(200, withApiResponse(mockPayment));

      // This tests the full integration:
      // 1. Client authenticates and caches token
      // 2. Client makes authenticated API request  
      // 3. Response is parsed correctly (snake_case → camelCase)
      const response = await client.getPayment("pay_123");

      expect(response.data.id).toEqual("pay_123");
      expect(response.data.amount).toEqual(1000);
      expect(authMock.isDone()).toEqual(true);
      expect(apiMock.isDone()).toEqual(true);
    });

    it("handles sub-account requests with correct headers", async () => {
      const subAccountId = "acc_sub123";
      
      const authMock = nock(mockBaseUrl, { reqheaders: defaultHeaders })
        .post("/oauth/token", toSnakeCase(credentials))
        .once()
        .reply(200, token);

      const apiMock = nock(mockBaseUrl)
        .get("/v1/payments", undefined, { 
          reqheaders: { 
            ...authHeaders, 
            "Sub-Account": subAccountId 
          } 
        })
        .once()
        .reply(200, withApiResponse([]));

      const response = await client.listPayments(undefined, subAccountId);
      
      expect(response.data).toEqual([]);
      expect(authMock.isDone()).toEqual(true);
      expect(apiMock.isDone()).toEqual(true);
    });
  });

  describe("Token Caching", () => {
    it("reuses cached token for multiple requests", async () => {
      // Should only call auth once
      const authMock = nock(mockBaseUrl, { reqheaders: defaultHeaders })
        .post("/oauth/token", toSnakeCase(credentials))
        .once()
        .reply(200, token);

      const payment1Mock = nock(mockBaseUrl)
        .get("/v1/payments/pay_123", undefined, { reqheaders: authHeaders })
        .once()
        .reply(200, withApiResponse({ id: "pay_123" }));

      const payment2Mock = nock(mockBaseUrl)
        .get("/v1/payments/pay_456", undefined, { reqheaders: authHeaders })
        .once()
        .reply(200, withApiResponse({ id: "pay_456" }));

      // Two API calls should share the same token
      await client.getPayment("pay_123");
      await client.getPayment("pay_456");

      expect(authMock.isDone()).toEqual(true);
      expect(payment1Mock.isDone()).toEqual(true);
      expect(payment2Mock.isDone()).toEqual(true);
    });
  });
});