import "jest";
import { toSnakeCase } from "../../lib/internal/converter";
import nock, { Scope } from "nock";
import { subAccount1, subAccount2 } from "../data/account";
import { AccountStatus } from "../../lib/internal/account";
import { withApiResponse } from "../data/http";
import { getTestSetupData } from "../setup";

describe("Account", () => {
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

  describe("creating sub account", () => {
    it("creates the sub account", async () => {
      serverMock
        .post(
          "/v1/sub_accounts",
          toSnakeCase({ name: subAccount1.name }),
          { reqheaders: authHeaders }
        )
        .once()
        .reply(201, withApiResponse(subAccount1));
      const subAccount = await client.createSubAccount(
        subAccount1.name
      );

      expect(subAccount.data).toEqual(subAccount1);
      expect(serverMock.isDone()).toEqual(true);
      expect(serverMock.pendingMocks()).toHaveLength(0);
    });
  });

  describe("list sub accounts", () => {
    describe("when not filtering by status", () => {
      it("lists the sub accounts", async () => {
        serverMock
          .get("/v1/sub_accounts", undefined, { reqheaders: authHeaders })
          .once()
          .reply(200, withApiResponse([subAccount1, subAccount2]));

        const subAccounts = await client.listSubAccounts();
        expect(subAccounts.data).toEqual([subAccount1, subAccount2]);
        expect(serverMock.isDone()).toEqual(true);
        expect(serverMock.pendingMocks()).toHaveLength(0);
      });
    });

    describe("when filtering by status", () => {
      it("lists the sub accounts filtered by status", async () => {
        serverMock
          .get("/v1/sub_accounts", undefined, { reqheaders: authHeaders })
          .query({ status: AccountStatus.Enabled })
          .once()
          .reply(200, withApiResponse([subAccount1]));

        const subAccounts = await client.listSubAccounts(
          AccountStatus.Enabled
        );
        expect(subAccounts.data).toEqual([subAccount1]);
        expect(serverMock.isDone()).toEqual(true);
        expect(serverMock.pendingMocks()).toHaveLength(0);
      });
    });
  });

  describe("get sub account", () => {
    it("gets the sub account", async () => {
      serverMock
        .get(`/v1/sub_accounts/${subAccount1.id}`, undefined, {
          reqheaders: authHeaders,
        })
        .once()
        .reply(200, withApiResponse(subAccount1));

      const subAccount = await client.getSubAccount(subAccount1.id);
      expect(subAccount.data).toEqual(subAccount1);
      expect(serverMock.isDone()).toEqual(true);
      expect(serverMock.pendingMocks()).toHaveLength(0);
    });
  });
});
