import "jest";
import nock from "nock";
import { Scope } from "nock/types";
import { toSnakeCase } from "../../lib/internal/converter";
import { withApiResponse } from "../data/http";
import { refund1, refund2 } from "../data/refund";
import { getTestSetupData } from "../setup";

describe("Refund", () => {
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

  describe("list refunds", () => {
    describe("when sub account id is not provided", () => {
      it("lists refunds for direct sub", async () => {
        serverMock
          .get("/v1/refunds", undefined, { reqheaders: authHeaders })
          .once()
          .reply(200, withApiResponse([refund1, refund2]));

        const refunds = await client.listRefunds();
        expect(refunds.data).toEqual([refund1, refund2]);
        expect(serverMock.isDone()).toEqual(true);
        expect(serverMock.pendingMocks()).toHaveLength(0);
      });
    });

    describe("when sub account id is provided", () => {
      const subAccountId = "acc_abc";

      it("lists refunds for the platform's sub id", async () => {
        serverMock
          .get("/v1/refunds", undefined, {
            reqheaders: { ...authHeaders, "Sub-Account": subAccountId },
          })
          .once()
          .reply(200, withApiResponse([refund1]));

        const refunds = await client.listRefunds(subAccountId);
        expect(refunds.data).toEqual([refund1]);
        expect(serverMock.isDone()).toEqual(true);
        expect(serverMock.pendingMocks()).toHaveLength(0);
      });
    });
  });

  describe("get refund", () => {
    it("gets the refund by id", async () => {
      serverMock
        .get(`/v1/refunds/${refund1.id}`, undefined, {
          reqheaders: authHeaders,
        })
        .once()
        .reply(200, withApiResponse(refund1));

      const refund = await client.getRefund(refund1.id);
      expect(refund.data).toEqual(refund1);
      expect(serverMock.isDone()).toEqual(true);
      expect(serverMock.pendingMocks()).toHaveLength(0);
    });
  });

  describe("update refund", () => {
    const metadata = { someExtra: "data" };
    const idempotencyKey = "abcxyz123";
    it("updates the refund with the provided information", async () => {
      serverMock
        .patch(`/v1/refunds/${refund1.id}`, toSnakeCase({ metadata }), {
          reqheaders: { ...authHeaders, "Idempotency-Key": idempotencyKey },
        })
        .once()
        .reply(200, withApiResponse(refund1));

      const refund = await client.updateRefund(
        refund1.id,
        metadata,
        idempotencyKey
      );
      expect(refund.data).toEqual(refund1);
      expect(serverMock.isDone()).toEqual(true);
      expect(serverMock.pendingMocks()).toHaveLength(0);
    });
  });
});
