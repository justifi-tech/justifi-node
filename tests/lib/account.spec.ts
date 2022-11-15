import "jest";
import Justifi from "../../lib";
import { toSnakeCase } from "../../lib/converter";
import { DEFAULT_HEADERS } from "../../lib/http";
import nock, { Scope } from "nock";
import { sellerAccount1, sellerAccount2 } from "../data/account";
import { AccountStatus } from "../../lib/account";
import { withApiResponse } from "../data/http";

describe("Account", () => {
  const mockBaseUrl = process.env.JUSTIFI_API_URL;
  if (!mockBaseUrl) {
    throw new Error("JUSTIFI_API_URL must be set for testing");
  }
  const credentials = {
    clientId: "some_client_id",
    clientSecret: "some_client_secret",
  };

  const client = Justifi.client().withCredentials(credentials);

  const token = { access_token: "some_access_token" };
  const AUTH_HEADERS = {
    Authorization: `Bearer ${token}`,
    ...DEFAULT_HEADERS,
  };

  let serverMock: Scope;
  beforeEach(() => {
    serverMock = nock(mockBaseUrl, {
      reqheaders: DEFAULT_HEADERS,
    })
      .post("/oauth/token", toSnakeCase(credentials))
      .once()
      .reply(200, token);
  });

  afterEach(() => {
    nock.cleanAll();
    client.clearCache();
  });

  describe("creating seller account", () => {
    it("creates the seller account", async () => {
      serverMock
        .post(
          "/v1/seller_accounts",
          toSnakeCase({ name: sellerAccount1.name }),
          { reqheaders: AUTH_HEADERS }
        )
        .once()
        .reply(201, withApiResponse(sellerAccount1));
      const sellerAccount = await client.createSellerAccount(
        sellerAccount1.name
      );

      expect(sellerAccount.data).toEqual(sellerAccount1);
      expect(serverMock.isDone()).toEqual(true);
      expect(serverMock.pendingMocks()).toHaveLength(0);
    });
  });

  describe("list seller accounts", () => {
    describe("when not filtering by status", () => {
      it("lists the seller accounts", async () => {
        serverMock
          .get("/v1/seller_accounts", undefined, { reqheaders: AUTH_HEADERS })
          .once()
          .reply(200, withApiResponse([sellerAccount1, sellerAccount2]));

        const sellerAccounts = await client.listSellerAccounts();
        expect(sellerAccounts.data).toEqual([sellerAccount1, sellerAccount2]);
        expect(serverMock.isDone()).toEqual(true);
        expect(serverMock.pendingMocks()).toHaveLength(0);
      });
    });

    describe("when filtering by status", () => {
      it("lists the seller accounts filtered by status", async () => {
        serverMock
          .get("/v1/seller_accounts", undefined, { reqheaders: AUTH_HEADERS })
          .query({ status: AccountStatus.Enabled })
          .once()
          .reply(200, withApiResponse([sellerAccount1]));

        const sellerAccounts = await client.listSellerAccounts(
          AccountStatus.Enabled
        );
        expect(sellerAccounts.data).toEqual([sellerAccount1]);
        expect(serverMock.isDone()).toEqual(true);
        expect(serverMock.pendingMocks()).toHaveLength(0);
      });
    });
  });

  describe("get seller account", () => {
    it("gets the seller account", async () => {
      serverMock
        .get(`/v1/seller_accounts/${sellerAccount1.id}`, undefined, {
          reqheaders: AUTH_HEADERS,
        })
        .once()
        .reply(200, withApiResponse(sellerAccount1));

      const sellerAccount = await client.getSellerAccount(sellerAccount1.id);
      expect(sellerAccount.data).toEqual(sellerAccount1);
      expect(serverMock.isDone()).toEqual(true);
      expect(serverMock.pendingMocks()).toHaveLength(0);
    });
  });
});
