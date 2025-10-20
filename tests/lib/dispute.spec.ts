import "jest";
import { toSnakeCase } from "../../lib/internal/converter";
import nock, { Scope } from "nock";
import { withApiResponse } from "../data/http";
import { getTestSetupData } from "../setup";
import { dispute1, dispute2, updateDispute } from "../data/dispute";

describe("Dispute", () => {
  const idempotencyKey = "1234567890abcdefg";
  const subAccountId = "acc_abc123";
  const {
    mockBaseUrl,
    credentials,
    client,
    token,
    authHeaders,
    defaultHeaders,
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

  describe("list disputes", () => {
    describe("when not filtering by sub account", () => {
      it("lists the disputes for direct sub", async () => {
        serverMock
          .get("/v1/disputes", undefined, { reqheaders: authHeaders })
          .once()
          .reply(200, withApiResponse([dispute1, dispute2]));

        const disputes = await client.listDisputes();
        expect(disputes.data).toEqual([dispute1, dispute2]);
        expect(serverMock.isDone()).toEqual(true);
        expect(serverMock.pendingMocks()).toHaveLength(0);
      });
    });

    describe("when filtering by sub account", () => {
      it("lists the disputes for the sub account", async () => {
        serverMock
          .get("/v1/disputes", undefined, {
            reqheaders: { ...authHeaders, "Sub-Account": subAccountId }
          })
          .once()
          .reply(200, withApiResponse([dispute1]));

        const dispute = await client.listDisputes(subAccountId);
        expect(dispute.data).toEqual([dispute1]);
        expect(serverMock.isDone()).toEqual(true);
        expect(serverMock.pendingMocks()).toHaveLength(0);
      });
    });
  });

  describe("get dispute", () => {
    it("gets the dispute", async () => {
      serverMock
        .get(`/v1/disputes/${dispute1.id}`, undefined, {
          reqheaders: authHeaders,
        })
        .once()
        .reply(200, withApiResponse(dispute1));

      const dispute = await client.getDispute(dispute1.id);
      expect(dispute.data).toEqual(dispute1);
      expect(serverMock.isDone()).toEqual(true);
      expect(serverMock.pendingMocks()).toHaveLength(0);
    });
  });

  describe("update dispute", () => {
    it("updates the dispute", async () => {
      serverMock
        .patch(`/v1/disputes/${dispute1.id}`, toSnakeCase(updateDispute), {
          reqheaders: { ...authHeaders, "Idempotency-Key": idempotencyKey },
        })
        .once()
        .reply(200, withApiResponse(dispute1));

      const dispute = await client.updateDispute(dispute1.id, idempotencyKey, updateDispute);
      expect(dispute.data).toEqual(dispute1);
      expect(serverMock.isDone()).toEqual(true);
      expect(serverMock.pendingMocks()).toHaveLength(0);
    })
  })
});
