import "jest";
import nock from "nock";
import { Scope } from "nock/types";
import { toSnakeCase } from "../../lib/internal/converter";
import { withApiResponse } from "../data/http";
import { business } from "../data/business";
import { getTestSetupData } from "../setup";

describe("Business", () => {
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

  describe("create business", () => {
    it("creates the business", async () => {
      serverMock
        .post("/v1/entities/business", toSnakeCase({ legalName: business.legalName }), { reqheaders: authHeaders })
        .once()
        .reply(201, withApiResponse(business))

      const response = await client.createBusiness(business.legalName);
      expect(response.data.id).not.toBeNull()
      expect(serverMock.isDone()).toEqual(true);
      expect(serverMock.pendingMocks()).toHaveLength(0);
    })
  })
})
