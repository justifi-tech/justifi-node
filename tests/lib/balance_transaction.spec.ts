import "jest";
import nock from "nock";
import { Scope } from "nock/types";
import { toSnakeCase } from "../../lib/internal/converter";
import { balanceTransaction1, balanceTransaction2 } from "../data/balance_transaction";
import { withApiResponse } from "../data/http";
import { getTestSetupData } from "../setup";

describe("Balance Transaction", () => {
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

  describe("list balance transactions", () => {
    describe("when not filtering by payout id", () => {
      it("lists all balance transactions", async () => {
        serverMock
          .get("/v1/balance_transactions", undefined, { reqheaders: authHeaders })
          .once()
          .reply(200, withApiResponse([balanceTransaction1, balanceTransaction2]));

        const balanceTransactions = await client.listBalanceTransactions();
        expect(balanceTransactions.data).toEqual([balanceTransaction1, balanceTransaction2]);
        expect(serverMock.isDone()).toEqual(true);
        expect(serverMock.pendingMocks()).toHaveLength(0);
      });
    });

    describe("when filtering by payout id", () => {
      it("lists balance transactions for payout id", async () => {
        const payoutId = "po_xyz";

        serverMock
          .get(`/v1/balance_transactions?payout_id=${payoutId}`, undefined, { reqheaders: authHeaders })
          .once()
          .reply(200, withApiResponse([balanceTransaction1]));

        const balanceTransactions = await client.listBalanceTransactions(payoutId);
        expect(balanceTransactions.data).toEqual([balanceTransaction1]);
        expect(serverMock.isDone()).toEqual(true);
        expect(serverMock.pendingMocks()).toHaveLength(0);
      });
    });
  });

  describe("get balance transactions", () => {
    it("gets the balance transaction", async () => {
      serverMock
        .get(`/v1/balance_transactions/${balanceTransaction1.id}`, undefined, {
          reqheaders: authHeaders,
        })
        .once()
        .reply(200, withApiResponse(balanceTransaction1));

      const balanceTransaction = await client.getBalanceTransaction(balanceTransaction1.id);
      expect(balanceTransaction.data).toEqual(balanceTransaction1);
      expect(serverMock.isDone()).toEqual(true);
      expect(serverMock.pendingMocks()).toHaveLength(0);
    });
  });
});
