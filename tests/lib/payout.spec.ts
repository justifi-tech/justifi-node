import "jest";
import nock from "nock";
import { Scope } from "nock/types";
import { toSnakeCase } from "../../lib/internal/converter";
import { withApiResponse } from "../data/http";
import { getTestSetupData } from "../setup";
import { payout1, payout2, updatePayout } from "../data/payout";

describe("Payout", () => {
  const {
    mockBaseUrl,
    credentials,
    client,
    token,
    defaultHeaders,
    authHeaders,
  } = getTestSetupData();
  const idempotencyKey = "1234567890abcdefg";

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

  describe("list payouts", () => {
    describe("when not filters are applied", () => {
      it("lists all payouts", async () => {
        serverMock
          .get("/v1/payouts", undefined, { reqheaders: authHeaders })
          .once()
          .reply(200, withApiResponse([payout1, payout2]));

        const payouts = await client.listPayouts();
        expect(payouts.data).toEqual([payout1, payout2]);
        expect(serverMock.isDone()).toEqual(true);
        expect(serverMock.pendingMocks()).toHaveLength(0);
      });
    });

    describe("when filtering by before created at", () => {
      it("lists all payouts created before date", async () => {
        serverMock
          .get(`/v1/payouts?created_before=${payout1.createdAt}`, undefined, { reqheaders: authHeaders })
          .once()
          .reply(200, withApiResponse([payout1]));

        const payouts = await client.listPayouts({ createdBefore: payout1.createdAt });
        expect(payouts.data).toEqual([payout1]);
        expect(serverMock.isDone()).toEqual(true);
        expect(serverMock.pendingMocks()).toHaveLength(0);
      });
    });

    describe("when filtering by after created at", () => {
      it("lists all payouts created after date", async () => {
        serverMock
          .get(`/v1/payouts?created_after=${payout1.createdAt}`, undefined, { reqheaders: authHeaders })
          .once()
          .reply(200, withApiResponse([payout1]));

        const payouts = await client.listPayouts({ createdAfter: payout1.createdAt });
        expect(payouts.data).toEqual([payout1]);
        expect(serverMock.isDone()).toEqual(true);
        expect(serverMock.pendingMocks()).toHaveLength(0);
      });
    });

    describe("when filtering by deposits before", () => {
      it("lists all payouts with deposits before date", async () => {
        serverMock
          .get(`/v1/payouts?deposits_before=${payout1.createdAt}`, undefined, { reqheaders: authHeaders })
          .once()
          .reply(200, withApiResponse([payout1]));

        const payouts = await client.listPayouts({ depositsBefore: payout1.createdAt });
        expect(payouts.data).toEqual([payout1]);
        expect(serverMock.isDone()).toEqual(true);
        expect(serverMock.pendingMocks()).toHaveLength(0);
      });
    });

    describe("when filtering by deposits after", () => {
      it("lists all payouts with deposits after date", async () => {
        serverMock
          .get(`/v1/payouts?deposits_after=${payout1.createdAt}`, undefined, { reqheaders: authHeaders })
          .once()
          .reply(200, withApiResponse([payout1]));

        const payouts = await client.listPayouts({ depositsAfter: payout1.createdAt });
        expect(payouts.data).toEqual([payout1]);
        expect(serverMock.isDone()).toEqual(true);
        expect(serverMock.pendingMocks()).toHaveLength(0);
      });
    });
  });

  describe("get payout", () => {
    it("gets the payout for the payout id", async () => {
      serverMock
        .get(`/v1/payouts/${payout1.id}`, undefined, {
          reqheaders: authHeaders,
        })
        .once()
        .reply(200, withApiResponse(payout1));

      const payment = await client.getPayout(payout1.id);
      expect(payment.data).toEqual(payout1);
      expect(serverMock.isDone()).toEqual(true);
      expect(serverMock.pendingMocks()).toHaveLength(0);
    });
  });

  describe("update payout", () => {
    it("updates the payout with the provided data", async () => {
      serverMock
        .patch(
          `/v1/payouts/${payout1.id}`,
          toSnakeCase(updatePayout),
          { reqheaders: { ...authHeaders, "Idempotency-Key": idempotencyKey } }
        )
        .once()
        .reply(200, withApiResponse(payout1));

      const payout = await client.updatePayout(
        payout1.id,
        idempotencyKey,
        updatePayout
      );
      expect(payout.data).toEqual(payout1);
      expect(serverMock.isDone()).toEqual(true);
      expect(serverMock.pendingMocks()).toHaveLength(0);
    });
  });
});
