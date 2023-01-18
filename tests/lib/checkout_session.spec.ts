import "jest";
import nock from "nock";
import { Scope } from "nock/types";
import { toSnakeCase } from "../../lib/internal/converter";
import { withApiResponse } from "../data/http";
import { getTestSetupData } from "../setup";
import { createCheckoutSession, createCheckoutSessionResponse } from "../data/checkout_session";

describe("Checkout Session", () => {
  const {
    mockBaseUrl,
    credentials,
    client,
    token,
    defaultHeaders,
    authHeaders,
  } = getTestSetupData();
  let serverMock: Scope;
  beforeEach(() => {
    serverMock = nock(mockBaseUrl, {
      reqheaders: defaultHeaders,
    })
      .post("/oauth/token", toSnakeCase(credentials))
      .once()
      .reply(200, token);
  });

  afterEach(() => {
    nock.cleanAll();
    client.clearCache();
  });

  describe("create checkout session", () => {
    it("creates the checkout session for the payment intent id", async () => {
      serverMock
        .post(
          `/v1/checkout_sessions`,
          toSnakeCase(createCheckoutSession),
          { reqheaders: authHeaders }
        )
        .once()
        .reply(200, withApiResponse(createCheckoutSessionResponse));

      const checkoutSessionResponse = await client.createCheckoutSession(createCheckoutSession);
      expect(checkoutSessionResponse.data).toEqual(createCheckoutSessionResponse);
      expect(serverMock.isDone()).toEqual(true);
      expect(serverMock.pendingMocks()).toHaveLength(0);
    });
  });
});
