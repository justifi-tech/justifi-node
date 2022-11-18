import "jest";
import nock from "nock";
import { Scope } from "nock/types";
import { toSnakeCase } from "../../lib/internal/converter";
import { withApiResponse } from "../data/http";
import { payment1, payment2 } from "../data/payment";
import {
  capturePaymentIntentPayload,
  createPaymentIntentPayload,
  paymentIntent1,
  paymentIntent2,
  updatePaymentIntentPayload,
} from "../data/payment_intent";
import { getTestSetupData } from "../setup";

describe("Payment Intent", () => {
  const {
    mockBaseUrl,
    credentials,
    client,
    token,
    defaultHeaders,
    authHeaders,
  } = getTestSetupData();
  const idempotencyKey = "1234567890abcdefg";
  const sellerAccountId = "acc_abc123";

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

  describe("create payment intent", () => {
    describe("when seller account id is provided", () => {
      it("creates the payment intent for the seller id", async () => {
        serverMock
          .post(
            "/v1/payment_intents",
            toSnakeCase(createPaymentIntentPayload),
            {
              reqheaders: {
                ...authHeaders,
                "Idempotency-Key": idempotencyKey,
                "Seller-Account": sellerAccountId,
              },
            }
          )
          .once()
          .reply(201, withApiResponse(paymentIntent1));

        const paymentIntent = await client.createPaymentIntent(
          idempotencyKey,
          createPaymentIntentPayload,
          sellerAccountId
        );
        expect(paymentIntent.data).toEqual(paymentIntent1);
        expect(serverMock.isDone()).toEqual(true);
        expect(serverMock.pendingMocks()).toHaveLength(0);
      });
    });

    describe("when seller account id is not provided", () => {
      it("creates the payment id for direct seller", async () => {
        serverMock
          .post(
            "/v1/payment_intents",
            toSnakeCase(createPaymentIntentPayload),
            {
              reqheaders: {
                ...authHeaders,
                "Idempotency-Key": idempotencyKey,
              },
            }
          )
          .once()
          .reply(201, withApiResponse(paymentIntent1));

        const paymentIntent = await client.createPaymentIntent(
          idempotencyKey,
          createPaymentIntentPayload
        );
        expect(paymentIntent.data).toEqual(paymentIntent1);
        expect(serverMock.isDone()).toEqual(true);
        expect(serverMock.pendingMocks()).toHaveLength(0);
      });
    });
  });

  describe("list payment intents", () => {
    describe("when seller account id is provided", () => {
      it("lists payment intents for the seller id", async () => {
        serverMock
          .get("/v1/payment_intents", undefined, {
            reqheaders: { ...authHeaders, "Seller-Account": sellerAccountId },
          })
          .once()
          .reply(200, withApiResponse([paymentIntent1, paymentIntent2]));

        const paymentIntents = await client.listPaymentIntents(sellerAccountId);
        expect(paymentIntents.data).toEqual([paymentIntent1, paymentIntent2]);
        expect(serverMock.isDone()).toEqual(true);
        expect(serverMock.pendingMocks()).toHaveLength(0);
      });
    });

    describe("when seller account id is not provided", () => {
      it("lists payment intents for the direct seller", async () => {
        serverMock
          .get("/v1/payment_intents", undefined, { reqheaders: authHeaders })
          .once()
          .reply(200, withApiResponse([paymentIntent1]));

        const paymentIntents = await client.listPaymentIntents();
        expect(paymentIntents.data).toEqual([paymentIntent1]);
        expect(serverMock.isDone()).toEqual(true);
        expect(serverMock.pendingMocks()).toHaveLength(0);
      });
    });
  });

  describe("get payment intent", () => {
    it("gets the payment intent by id", async () => {
      serverMock
        .get(`/v1/payment_intents/${paymentIntent1.id}`, undefined, {
          reqheaders: authHeaders,
        })
        .once()
        .reply(200, withApiResponse(paymentIntent1));

      const paymentIntent = await client.getPaymentIntent(paymentIntent1.id);
      expect(paymentIntent.data).toEqual(paymentIntent1);
      expect(serverMock.isDone()).toEqual(true);
      expect(serverMock.pendingMocks()).toHaveLength(0);
    });
  });

  describe("update payment intent", () => {
    it("updates the payment intent with the provided data", async () => {
      serverMock
        .patch(
          `/v1/payment_intents/${paymentIntent1.id}`,
          toSnakeCase(updatePaymentIntentPayload),
          { reqheaders: { ...authHeaders, "Idempotency-Key": idempotencyKey } }
        )
        .once()
        .reply(200, withApiResponse(paymentIntent1));

      const paymentIntent = await client.updatePaymentIntent(
        paymentIntent1.id,
        idempotencyKey,
        updatePaymentIntentPayload
      );
      expect(paymentIntent.data).toEqual(paymentIntent1);
      expect(serverMock.isDone()).toEqual(true);
      expect(serverMock.pendingMocks()).toHaveLength(0);
    });
  });

  describe("capture payment intent", () => {
    it("captures the payment intent", async () => {
      serverMock
        .post(
          `/v1/payment_intents/${paymentIntent1.id}/capture`,
          toSnakeCase(capturePaymentIntentPayload),
          { reqheaders: { ...authHeaders, "Idempotency-Key": idempotencyKey } }
        )
        .once()
        .reply(201, withApiResponse(paymentIntent1));

      const paymentIntent = await client.capturePaymentIntent(
        paymentIntent1.id,
        idempotencyKey,
        capturePaymentIntentPayload
      );
      expect(paymentIntent.data).toEqual(paymentIntent1);
      expect(serverMock.isDone()).toEqual(true);
      expect(serverMock.pendingMocks()).toHaveLength(0);
    });
  });

  describe("list payments for payment intent", () => {
    it("lists all payments related to the payment intent", async () => {
      serverMock
        .get(`/v1/payment_intents/${paymentIntent1.id}/payments`, undefined, {
          reqheaders: authHeaders,
        })
        .once()
        .reply(200, withApiResponse([payment1, payment2]));

      const paymentIntent = await client.listPaymentsForPaymentIntent(
        paymentIntent1.id
      );
      expect(paymentIntent.data).toEqual([payment1, payment2]);
      expect(serverMock.isDone()).toEqual(true);
      expect(serverMock.pendingMocks()).toHaveLength(0);
    });
  });
});
