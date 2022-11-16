import "jest";
import nock from "nock";
import { toSnakeCase } from "../../lib/converter";
import { InternalError } from "../../lib/error";
import { JustifiRequest, RequestMethod } from "../../lib/http";

describe("http", () => {
  const baseUrl = process.env.JUSTIFI_API_URL;
  if (!baseUrl) {
    throw new Error("JUSTIFI_API_URL must be set");
  }

  describe("with headers", () => {
    it("adds headers correctly", async () => {
      const headers = { first: "header", second: "header" };
      const mockServer = nock(baseUrl)
        .get("/", undefined, { reqheaders: headers })
        .once()
        .reply(200, {});

      await new JustifiRequest(RequestMethod.Get, "/")
        .withHeader("first", "header")
        .withHeader("second", "header")
        .execute();

      expect(mockServer.isDone()).toEqual(true);
      expect(mockServer.pendingMocks()).toHaveLength(0);
    });
  });

  describe("with query param", () => {
    it("adds a single query param correctly", async () => {
      const mockServer = nock(baseUrl)
        .get("/?test=param")
        .once()
        .reply(200, {});

      await new JustifiRequest(RequestMethod.Get, "/")
        .withQueryParam("test", "param")
        .execute();

      expect(mockServer.isDone()).toEqual(true);
      expect(mockServer.pendingMocks()).toHaveLength(0);
    });

    it("adds multiple query params correctly", async () => {
      const mockServer = nock(baseUrl)
        .get("/?test=param&another=test")
        .once()
        .reply(200, {});

      await new JustifiRequest(RequestMethod.Get, "/")
        .withQueryParam("test", "param")
        .withQueryParam("another", "test")
        .execute();

      expect(mockServer.isDone()).toEqual(true);
      expect(mockServer.pendingMocks()).toHaveLength(0);
    });

    it("adds query params object correctly", async () => {
      const params = { first: "param", second: "param", third: "param" };
      const mockServer = nock(baseUrl)
        .get("/?first=param&second=param&third=param")
        .once()
        .reply(200, {});

      await new JustifiRequest(RequestMethod.Get, "/")
        .withQueryParams(params)
        .execute();

      expect(mockServer.isDone()).toEqual(true);
      expect(mockServer.pendingMocks()).toHaveLength(0);
    });

    it("does not add if provided params is empty", async () => {
      const mockServer = nock(baseUrl).get("/").once().reply(200, {});

      await new JustifiRequest(RequestMethod.Get, "/")
        .withQueryParams({})
        .execute();

      expect(mockServer.isDone()).toEqual(true);
      expect(mockServer.pendingMocks()).toHaveLength(0);
    });
  });

  describe("with body", () => {
    it("adds the body converted to snake case", async () => {
      const body = {
        firstCamel: "item",
        secondCamel: "item",
        thirdCamel: "item",
      };
      const mockServer = nock(baseUrl)
        .post("/", toSnakeCase(body))
        .once()
        .reply(200, {});

      await new JustifiRequest(RequestMethod.Post, "/")
        .withBody(body)
        .execute();

      expect(mockServer.isDone()).toEqual(true);
      expect(mockServer.pendingMocks()).toHaveLength(0);
    });
  });

  describe("with auth", () => {
    it("adds auth header correctly", async () => {
      const token = "my_token";
      const authHeader = { Authorization: `Bearer ${token}` };
      const mockServer = nock(baseUrl)
        .get("/", undefined, { reqheaders: authHeader })
        .once()
        .reply(200, {});

      await new JustifiRequest(RequestMethod.Get, "/")
        .withAuth(token)
        .execute();

      expect(mockServer.isDone()).toEqual(true);
      expect(mockServer.pendingMocks()).toHaveLength(0);
    });
  });

  describe("with idempotency key", () => {
    it("adds idempotency key header correctly", async () => {
      const key = "my_key";
      const idempotencyHeader = { "Idempotency-Key": key };
      const mockServer = nock(baseUrl)
        .get("/", undefined, { reqheaders: idempotencyHeader })
        .once()
        .reply(200, {});

      await new JustifiRequest(RequestMethod.Get, "/")
        .withIdempotencyKey(key)
        .execute();

      expect(mockServer.isDone()).toEqual(true);
      expect(mockServer.pendingMocks()).toHaveLength(0);
    });
  });

  describe("execute with retry", () => {
    describe("when using default retries", () => {
      it("retries 3 times", async () => {
        const mockServer = nock(baseUrl)
          .get("/")
          .times(3)
          .replyWithError("retry");

        await expect(
          new JustifiRequest(RequestMethod.Get, "/").executeWithRetry()
        ).rejects.toEqual([
          new InternalError({ code: 500, message: "retry" }),
          new InternalError({ code: 500, message: "retry" }),
          new InternalError({ code: 500, message: "retry" }),
        ]);
        expect(mockServer.isDone()).toEqual(true);
        expect(mockServer.pendingMocks()).toHaveLength(0);
      });
    });

    describe("when using user defined retries", () => {
      it("retries 2 times", async () => {
        const mockServer = nock(baseUrl)
          .get("/")
          .times(2)
          .replyWithError("retry");

        await expect(
          new JustifiRequest(RequestMethod.Get, "/").executeWithRetry(2)
        ).rejects.toEqual([
          new InternalError({ code: 500, message: "retry" }),
          new InternalError({ code: 500, message: "retry" }),
        ]);
        expect(mockServer.isDone()).toEqual(true);
        expect(mockServer.pendingMocks()).toHaveLength(0);
      });
    });
  });
});
