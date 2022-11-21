import "jest";
import nock from "nock";
import { toSnakeCase } from "../../lib/internal/converter";
import { InternalError, NotFound, PaginationError } from "../../lib/internal/error";
import { ApiResponse, JustifiRequest, RequestMethod } from "../../lib/internal/http";
import { withApiResponse } from "../data/http";

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

    describe("when error is not internal error", () => {
      it("does not retry", async () => {
        const mockServer = nock(baseUrl)
          .get("/")
          .once()
          .reply(404, "dont retry");

        await expect(
          new JustifiRequest(RequestMethod.Get, "/").executeWithRetry()
        ).rejects.toEqual(new NotFound("dont retry"));
        expect(mockServer.isDone()).toEqual(true);
        expect(mockServer.pendingMocks()).toHaveLength(0);
      });
    });
  });

  describe("pagination", () => {
    type MockResponse = { a: number; b: number };

    describe("when requesting next page", () => {
      it("calls the api with the correct params", async () => {
        const mockServer = nock(baseUrl)
          .get("/")
          .once()
          .reply(200, withApiResponse([{ a: 1, b: 2 }], "abc123"));

        const result = await new JustifiRequest(RequestMethod.Get, "/").execute<
          ApiResponse<MockResponse>
        >();

        expect(mockServer.isDone()).toEqual(true);
        expect(mockServer.pendingMocks()).toHaveLength(0);

        mockServer
          .get(`/?after_cursor=${result.pageInfo.endCursor}`)
          .once()
          .reply(200, withApiResponse([{ a: 2, b: 3 }]));

        await result.nextPage();

        expect(mockServer.isDone()).toEqual(true);
        expect(mockServer.pendingMocks()).toHaveLength(0);
      });

      it("rejects if next page is not present", async () => {
        const mockServer = nock(baseUrl)
          .get("/")
          .once()
          .reply(200, withApiResponse([{ a: 1, b: 2 }]));

        const result: ApiResponse<MockResponse> = await new JustifiRequest(
          RequestMethod.Get,
          "/"
        ).execute();

        expect(mockServer.isDone()).toEqual(true);
        expect(mockServer.pendingMocks()).toHaveLength(0);

        await expect(result.nextPage()).rejects.toBeInstanceOf(PaginationError);

        expect(mockServer.isDone()).toEqual(true);
        expect(mockServer.pendingMocks()).toHaveLength(0);
      });

      it("adds the limit param if provided", async () => {
        const mockServer = nock(baseUrl)
          .get("/")
          .once()
          .reply(200, withApiResponse([{ a: 1, b: 2 }], "abc123"));

        const result: ApiResponse<MockResponse> = await new JustifiRequest(
          RequestMethod.Get,
          "/"
        ).execute();

        expect(mockServer.isDone()).toEqual(true);
        expect(mockServer.pendingMocks()).toHaveLength(0);

        const limit = 10;
        mockServer
          .get(`/?after_cursor=${result.pageInfo.endCursor}&limit=${limit}`)
          .once()
          .reply(200, withApiResponse([{ a: 2, b: 3 }]));

        await result.nextPage(limit);

        expect(mockServer.isDone()).toEqual(true);
        expect(mockServer.pendingMocks()).toHaveLength(0);
      });
    });

    describe("when requesting previous page", () => {
      it("calls the api with the correct params", async () => {
        const mockServer = nock(baseUrl)
          .get("/")
          .once()
          .reply(200, withApiResponse([{ a: 1, b: 2 }], undefined, "abc123"));

        const result: ApiResponse<MockResponse> = await new JustifiRequest(
          RequestMethod.Get,
          "/"
        ).execute();

        expect(mockServer.isDone()).toEqual(true);
        expect(mockServer.pendingMocks()).toHaveLength(0);

        mockServer
          .get(`/?before_cursor=${result.pageInfo.startCursor}`)
          .once()
          .reply(200, withApiResponse([{ a: 2, b: 3 }]));

        await result.previousPage();

        expect(mockServer.isDone()).toEqual(true);
        expect(mockServer.pendingMocks()).toHaveLength(0);
      });

      it("rejects if previous page is not present", async () => {
        const mockServer = nock(baseUrl)
          .get("/")
          .once()
          .reply(200, withApiResponse([{ a: 1, b: 2 }]));

        const result: ApiResponse<MockResponse> = await new JustifiRequest(
          RequestMethod.Get,
          "/"
        ).execute();

        expect(mockServer.isDone()).toEqual(true);
        expect(mockServer.pendingMocks()).toHaveLength(0);

        await expect(result.previousPage()).rejects.toBeInstanceOf(
          PaginationError
        );

        expect(mockServer.isDone()).toEqual(true);
        expect(mockServer.pendingMocks()).toHaveLength(0);
      });

      it("adds the limit param if provided", async () => {
        const mockServer = nock(baseUrl)
          .get("/")
          .once()
          .reply(200, withApiResponse([{ a: 1, b: 2 }], undefined, "abc123"));

        const result: ApiResponse<MockResponse> = await new JustifiRequest(
          RequestMethod.Get,
          "/"
        ).execute();

        expect(mockServer.isDone()).toEqual(true);
        expect(mockServer.pendingMocks()).toHaveLength(0);

        const limit = 10;
        mockServer
          .get(`/?before_cursor=${result.pageInfo.startCursor}&limit=${limit}`)
          .once()
          .reply(200, withApiResponse([{ a: 2, b: 3 }]));

        await result.previousPage(limit);

        expect(mockServer.isDone()).toEqual(true);
        expect(mockServer.pendingMocks()).toHaveLength(0);
      });
    });
  });
});
