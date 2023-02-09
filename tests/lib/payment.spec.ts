import "jest";
import nock from "nock";
import { Scope } from "nock/types";
import { toSnakeCase } from "../../lib/internal/converter";
import { PaymentStatus } from "../../lib/internal/payment";
import { withApiResponse } from "../data/http";
import {
  createPaymentPayload,
  payment1,
  payment2,
  paymentBalanceTransaction1,
  paymentBalanceTransaction2,
  refundPaymentPayload,
  updatePaymentPayload,
} from "../data/payment";
import { refund1 } from "../data/refund";
import { getTestSetupData } from "../setup";

describe("Payment", () => {
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

  describe("create payment", () => {
    describe("when sub account id is provided", () => {
      it("creates the payment for the sub id", async () => {
        serverMock
          .post("/v1/payments", toSnakeCase(createPaymentPayload), {
            reqheaders: {
              ...authHeaders,
              "Idempotency-Key": idempotencyKey,
              "Sub-Account": subAccountId,
            },
          })
          .once()
          .reply(201, withApiResponse(payment1));

        const payment = await client.createPayment(
          idempotencyKey,
          createPaymentPayload,
          subAccountId
        );
        expect(payment.data).toEqual(payment1);
        expect(serverMock.isDone()).toEqual(true);
        expect(serverMock.pendingMocks()).toHaveLength(0);
      });
    });

    describe("when sub account id is not provided", () => {
      it("creates the payment for the direct sub", async () => {
        serverMock
          .post("/v1/payments", toSnakeCase(createPaymentPayload), {
            reqheaders: { ...authHeaders, "Idempotency-Key": idempotencyKey },
          })
          .once()
          .reply(201, withApiResponse(payment1));

        const payment = await client.createPayment(
          idempotencyKey,
          createPaymentPayload
        );
        expect(payment.data).toEqual(payment1);
        expect(serverMock.isDone()).toEqual(true);
        expect(serverMock.pendingMocks()).toHaveLength(0);
      });
    });
  });

  describe("list payments", () => {
    describe("when sub account id is provided", () => {
      it("lists all payments for the sub id", async () => {
        serverMock
          .get("/v1/payments", undefined, {
            reqheaders: { ...authHeaders, "Sub-Account": subAccountId },
          })
          .once()
          .reply(200, withApiResponse([payment1, payment2]));

        const payment = await client.listPayments({}, subAccountId);
        expect(payment.data).toEqual([payment1, payment2]);
        expect(serverMock.isDone()).toEqual(true);
        expect(serverMock.pendingMocks()).toHaveLength(0);
      });
    });

    describe("when sub account id is not provided", () => {
      it("lists all payments for the direct sub", async () => {
        serverMock
          .get("/v1/payments", undefined, { reqheaders: authHeaders })
          .once()
          .reply(200, withApiResponse([payment1]));

        const payment = await client.listPayments();
        expect(payment.data).toEqual([payment1]);
        expect(serverMock.isDone()).toEqual(true);
        expect(serverMock.pendingMocks()).toHaveLength(0);
      });
    });

    describe("when filtering", () => {
      const filterStartDate = "2021-01-01T12:00:00Z";
      const filterEndDate = "2022-01-01T12:00:00Z";
      const filterStatus = PaymentStatus.Succeeded;

      it("filters with created before", async () => {
        serverMock
          .get(`/v1/payments?created_before=${filterEndDate}`, undefined, {
            reqheaders: authHeaders,
          })
          .once()
          .reply(200, withApiResponse([payment2]));

        const payment = await client.listPayments({
          createdBefore: filterEndDate,
        });
        expect(payment.data).toEqual([payment2]);
        expect(serverMock.isDone()).toEqual(true);
        expect(serverMock.pendingMocks()).toHaveLength(0);
      });

      it("filters with created after", async () => {
        serverMock
          .get(`/v1/payments?created_after=${filterStartDate}`, undefined, {
            reqheaders: authHeaders,
          })
          .once()
          .reply(200, withApiResponse([payment2]));

        const payment = await client.listPayments({
          createdAfter: filterStartDate,
        });
        expect(payment.data).toEqual([payment2]);
        expect(serverMock.isDone()).toEqual(true);
        expect(serverMock.pendingMocks()).toHaveLength(0);
      });

      it("filters with payment status", async () => {
        serverMock
          .get(`/v1/payments?payment_status=${filterStatus}`, undefined, {
            reqheaders: authHeaders,
          })
          .once()
          .reply(200, withApiResponse([payment2]));

        const payment = await client.listPayments({
          paymentStatus: filterStatus,
        });
        expect(payment.data).toEqual([payment2]);
        expect(serverMock.isDone()).toEqual(true);
        expect(serverMock.pendingMocks()).toHaveLength(0);
      });

      it("filters by all parameters", async () => {
        serverMock
          .get(
            `/v1/payments?created_before=${filterEndDate}&created_after=${filterStartDate}&payment_status=${filterStatus}`,
            undefined,
            {
              reqheaders: authHeaders,
            }
          )
          .once()
          .reply(200, withApiResponse([]));

        const payment = await client.listPayments({
          createdBefore: filterEndDate,
          createdAfter: filterStartDate,
          paymentStatus: filterStatus,
        });
        expect(payment.data).toEqual([]);
        expect(serverMock.isDone()).toEqual(true);
        expect(serverMock.pendingMocks()).toHaveLength(0);
      });
    });
  });

  describe("get payment", () => {
    it("gets the payment for the payment id", async () => {
      serverMock
        .get(`/v1/payments/${payment1.id}`, undefined, {
          reqheaders: authHeaders,
        })
        .once()
        .reply(200, withApiResponse(payment1));

      const payment = await client.getPayment(payment1.id);
      expect(payment.data).toEqual(payment1);
      expect(serverMock.isDone()).toEqual(true);
      expect(serverMock.pendingMocks()).toHaveLength(0);
    });
  });

  describe("update payment", () => {
    it("updates the payment with the provided data", async () => {
      serverMock
        .patch(
          `/v1/payments/${payment1.id}`,
          toSnakeCase(updatePaymentPayload),
          { reqheaders: { ...authHeaders, "Idempotency-Key": idempotencyKey } }
        )
        .once()
        .reply(200, withApiResponse(payment1));

      const payment = await client.updatePayment(
        idempotencyKey,
        payment1.id,
        updatePaymentPayload
      );
      expect(payment.data).toEqual(payment1);
      expect(serverMock.isDone()).toEqual(true);
      expect(serverMock.pendingMocks()).toHaveLength(0);
    });
  });

  describe("capture payment", () => {
    it("captures the payment for the provided id", async () => {
      serverMock
        .post(`/v1/payments/${payment1.id}/capture`, undefined, {
          reqheaders: { ...authHeaders, "Idempotency-Key": idempotencyKey },
        })
        .once()
        .reply(201, withApiResponse(payment1));

      const payment = await client.capturePayment(idempotencyKey, payment1.id);

      expect(payment.data).toEqual(payment1);
      expect(serverMock.isDone()).toEqual(true);
      expect(serverMock.pendingMocks()).toHaveLength(0);
    });
  });

  describe("refund payment", () => {
    it("refunds the payment for the provided id", async () => {
      serverMock
        .post(
          `/v1/payments/${payment1.id}/refunds`,
          toSnakeCase(refundPaymentPayload),
          { reqheaders: { ...authHeaders, "Idempotency-Key": idempotencyKey } }
        )
        .once()
        .reply(201, withApiResponse(refund1));

      const refund = await client.refundPayment(
        idempotencyKey,
        payment1.id,
        refundPaymentPayload
      );

      expect(refund.data).toEqual(refund1);
      expect(serverMock.isDone()).toEqual(true);
      expect(serverMock.pendingMocks()).toHaveLength(0);
    });
  });

  describe("get balance transactions", () => {
    it("gets balance transactions for the payment id", async () => {
      serverMock
        .get(
          `/v1/payments/${payment1.id}/payment_balance_transactions`,
          undefined,
          { reqheaders: authHeaders }
        )
        .once()
        .reply(
          200,
          withApiResponse([
            paymentBalanceTransaction1,
            paymentBalanceTransaction2,
          ])
        );

      const balanceTransactions = await client.getBalanceTransactions(
        payment1.id
      );
      expect(balanceTransactions.data).toEqual([
        paymentBalanceTransaction1,
        paymentBalanceTransaction2,
      ]);
      expect(serverMock.isDone()).toEqual(true);
      expect(serverMock.pendingMocks()).toHaveLength(0);
    });
  });
});
