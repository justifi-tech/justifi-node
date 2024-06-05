import "jest";
import nock from "nock";
import { Scope } from "nock/types";
import { toSnakeCase } from "../../lib/internal/converter";
import { withApiResponse } from "../data/http";
import { checkout1, checkout2 } from "../data/checkout";
import { getTestSetupData } from "../setup";

describe("Checkout", () => {
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

  describe("list checkouts", () => {
    describe("when seller account id is not provided", () => {
      it("lists checkouts for direct seller", async () => {
        serverMock
          .get("/v1/checkouts", undefined, { reqheaders: authHeaders })
          .once()
          .reply(200, withApiResponse([checkout1, checkout2]));

        const checkouts = await client.listCheckouts();
        expect(checkouts.data).toEqual([checkout1, checkout2]);
        expect(serverMock.isDone()).toEqual(true);
        expect(serverMock.pendingMocks()).toHaveLength(0);
      });
    });

    describe("when seller account id is provided", () => {
      const sellerAccountId = "acc_abc";

      it("lists checkouts for the platform's seller id", async () => {
        serverMock
          .get("/v1/checkouts", undefined, {
            reqheaders: { ...authHeaders, "Seller-Account": sellerAccountId },
          })
          .once()
          .reply(200, withApiResponse([checkout1]));

        const checkouts = await client.listCheckouts(sellerAccountId);
        expect(checkouts.data).toEqual([checkout1]);
        expect(serverMock.isDone()).toEqual(true);
        expect(serverMock.pendingMocks()).toHaveLength(0);
      });
    });
  });

  describe("get checkout", () => {
    it("gets the checkout by id", async () => {
      serverMock
        .get(`/v1/checkouts/${checkout1.id}`, undefined, {
          reqheaders: authHeaders,
        })
        .once()
        .reply(200, withApiResponse(checkout1));

      const checkout = await client.getCheckout(checkout1.id);
      expect(checkout.data).toEqual(checkout1);
      expect(serverMock.isDone()).toEqual(true);
      expect(serverMock.pendingMocks()).toHaveLength(0);
    });
  });

  describe("update checkout", () => {
    const amount = 1200;
    const description = "updated desc";
    it("updates the checkout with the provided information", async () => {
      serverMock
        .patch(`/v1/checkouts/${checkout1.id}`, toSnakeCase({ amount, description }), {
          reqheaders: { ...authHeaders },
        })
        .once()
        .reply(200, withApiResponse(checkout1));

      const checkout = await client.updateCheckout(
        checkout1.id,
        amount,
        description
      );
      expect(checkout.data).toEqual(checkout1);
      expect(serverMock.isDone()).toEqual(true);
      expect(serverMock.pendingMocks()).toHaveLength(0);
    });
  });
});
