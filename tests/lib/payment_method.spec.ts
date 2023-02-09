import nock from "nock";
import { Scope } from "nock/types";
import { toSnakeCase } from "../../lib/internal/converter";
import { createPaymentMethod, paymentMethod1, paymentMethod2, updatePaymentMethod } from "../data/payment_method";
import { getTestSetupData } from "../setup";
import { withApiResponse } from "../data/http";
import { PaymentMethodCard } from "../../lib/internal/payment_method";

describe("Payment Method", () => {
  const {
    mockBaseUrl,
    credentials,
    client,
    token,
    defaultHeaders,
    authHeaders,
  } = getTestSetupData();
  const idempotencyKey = "1234567890abcdefg";
  const subAccountId = "acc_abc123";

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

  describe("create payment method", () => {
    describe("when sub account id is provided", () => {
      it("creates the payment method for the sub id", async () => {
        serverMock
          .post(
            "/v1/payment_methods",
            toSnakeCase(createPaymentMethod),
            {
              reqheaders: {
                ...authHeaders,
                "Idempotency-Key": idempotencyKey,
                "Sub-Account": subAccountId,
              },
            }
          )
          .once()
          .reply(201, withApiResponse(paymentMethod1));

        const paymentMethod = await client.createPaymentMethod(
          createPaymentMethod,
          idempotencyKey,
          subAccountId
        );
        expect(paymentMethod.data).toEqual(paymentMethod1);
        expect(serverMock.isDone()).toEqual(true);
        expect(serverMock.pendingMocks()).toHaveLength(0);
      });
    });

    describe("when sub account id is not provided", () => {
      it("creates the payment method for direct sub", async () => {
        serverMock
          .post(
            "/v1/payment_methods",
            toSnakeCase(createPaymentMethod),
            {
              reqheaders: {
                ...authHeaders,
                "Idempotency-Key": idempotencyKey,
              },
            }
          )
          .once()
          .reply(201, withApiResponse(paymentMethod1));

        const paymentIntent = await client.createPaymentMethod(
          createPaymentMethod,
          idempotencyKey
        );
        expect(paymentIntent.data).toEqual(paymentMethod1);
        expect(serverMock.isDone()).toEqual(true);
        expect(serverMock.pendingMocks()).toHaveLength(0);
      });
    })
  })

  describe("list payment methods", () => {
    describe("when filtering by customer id", () => {
      it("lists payment methods for the customer id", async () => {
        const customerId = "cust_xyz";
        serverMock
          .get(`/v1/payment_methods?customer_id=${customerId}`, undefined, {
            reqheaders: { ...authHeaders, "Sub-Account": subAccountId },
          })
          .once()
          .reply(200, withApiResponse([paymentMethod1]));

        const paymentMethods = await client.listPaymentMethods(undefined, customerId);
        expect(paymentMethods.data).toEqual([paymentMethod1]);
        expect(serverMock.isDone()).toEqual(true);
        expect(serverMock.pendingMocks()).toHaveLength(0);
      });
    });

    describe("when sub account id is provided", () => {
      it("lists payment intents for the sub account", async () => {
        serverMock
          .get("/v1/payment_methods", undefined, {
            reqheaders: { ...authHeaders, "Sub-Account": subAccountId }
          })
          .once()
          .reply(200, withApiResponse([paymentMethod1]));

        const paymentMethods = await client.listPaymentMethods(subAccountId);
        expect(paymentMethods.data).toEqual([paymentMethod1]);
        expect(serverMock.isDone()).toEqual(true);
        expect(serverMock.pendingMocks()).toHaveLength(0);
      });
    });

    describe("when sub account is not provided", () => {
      it("lists payment intents for the platform", async () => {
        serverMock
          .get("/v1/payment_methods", undefined, {
            reqheaders: authHeaders
          })
          .once()
          .reply(200, withApiResponse([paymentMethod1, paymentMethod2]));

        const paymentMethods = await client.listPaymentMethods();
        expect(paymentMethods.data).toEqual([paymentMethod1, paymentMethod2]);
        expect(serverMock.isDone()).toEqual(true);
        expect(serverMock.pendingMocks()).toHaveLength(0);
      });
    })
  });

  describe("get payment method", () => {
    it("gets the payment method by token", async () => {
      serverMock
        .get(`/v1/payment_methods/${(paymentMethod1 as PaymentMethodCard).card.token}`, undefined, {
          reqheaders: authHeaders,
        })
        .once()
        .reply(200, withApiResponse(paymentMethod1));

      const paymentIntent = await client.getPaymentMethod((paymentMethod1 as PaymentMethodCard).card.token);
      expect(paymentIntent.data).toEqual(paymentMethod1);
      expect(serverMock.isDone()).toEqual(true);
      expect(serverMock.pendingMocks()).toHaveLength(0);
    });
  });

  describe("update payment method", () => {
    it("updates the payment method with the provided data", async () => {
      serverMock
        .patch(
          `/v1/payment_methods/${(paymentMethod1 as PaymentMethodCard).card.token}`,
          toSnakeCase(updatePaymentMethod),
          { reqheaders: { ...authHeaders, "Idempotency-Key": idempotencyKey } }
        )
        .once()
        .reply(200, withApiResponse(paymentMethod1));

      const paymentIntent = await client.updatePaymentMethod(
        updatePaymentMethod,
        (paymentMethod1 as PaymentMethodCard).card.token,
        idempotencyKey,
      );
      expect(paymentIntent.data).toEqual(paymentMethod1);
      expect(serverMock.isDone()).toEqual(true);
      expect(serverMock.pendingMocks()).toHaveLength(0);
    });
  });
})
