import "jest";
import nock from "nock";
import { Scope } from "nock/types";
import { toSnakeCase } from "../../lib/internal/converter";
import { withApiResponse } from "../data/http";
import { provisionProduct, provisionProductPayload } from "../data/provisioning";
import { getTestSetupData } from "../setup";

describe("Provisioning", () => {
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

  describe("provision product", () => {
    it("provisions the product", async () => {
      serverMock
        .post("/v1/entities/provisioning", toSnakeCase(provisionProductPayload), { reqheaders: authHeaders })
        .once()
        .reply(201, withApiResponse(provisionProduct))

      const response = await client.provisionProduct(provisionProductPayload);
      expect(response.data.subAccountId).not.toBeNull()
      expect(serverMock.isDone()).toEqual(true);
      expect(serverMock.pendingMocks()).toHaveLength(0);
    })
  })
})
