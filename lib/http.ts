import { OutgoingHttpHeaders } from "http";
import { request } from "https";
import { toCamelCase, toSnakeCase } from "./converter";
import {
  errorFromHttpStatus,
  InternalError,
  BaseError,
  PaginationError,
} from "./error";

export interface PageInfo {
  endCursor: string;
  startCursor: string;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface ApiResponseSchema<T> {
  id: number;
  type: string;
  data: T;
  pageInfo: PageInfo;
}

export class ApiResponse<T> implements ApiResponseSchema<T> {
  id: number;
  type: string;
  data: T;
  pageInfo: PageInfo;

  private request?: JustifiRequest;

  constructor(schema: ApiResponseSchema<T>) {
    this.id = schema.id;
    this.type = schema.type;
    this.data = schema.data;
    this.pageInfo = schema.pageInfo;
  }

  withRequest(request: JustifiRequest) {
    this.request = request;

    return this;
  }

  async nextPage(limit?: number): Promise<ApiResponse<T>> {
    if (!this.pageInfo.hasNext || !this.request) {
      return Promise.reject(
        new PaginationError("This is the last page, next page unavailable")
      );
    }

    let params: { after_cursor: string; limit?: number } = {
      after_cursor: this.pageInfo.endCursor,
    };
    if (limit) {
      params = { ...params, limit };
    }

    const res = this.request.withQueryParams(params).execute<T>();
    return Promise.resolve(res);
  }

  async previousPage(limit?: number): Promise<ApiResponse<T>> {
    if (!this.pageInfo.hasPrevious || !this.request) {
      return Promise.reject(
        new PaginationError("This is the last page, previous page unavailable")
      );
    }

    let params: { before_cursor: string; limit?: number } = {
      before_cursor: this.pageInfo.startCursor,
    };
    if (limit) {
      params = { ...params, limit };
    }

    const res = this.request.withQueryParams(params).execute<T>();

    return Promise.resolve(res);
  }
}

export enum RequestMethod {
  Get = "GET",
  Post = "POST",
  Patch = "PATCH",
}

export type RequestHeaders = { [key: string]: string };

export const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
  Accept: "application/json",
};

export class JustifiRequest {
  private maxRetries = 3;

  private requestUrl: URL;
  private method: RequestMethod;
  private headers: OutgoingHttpHeaders;
  private body?: any;

  constructor(method: RequestMethod, path: string) {
    this.requestUrl = new URL(this.getApiHost() + path);
    this.method = method;
    this.headers = DEFAULT_HEADERS;
  }

  withHeader(key: string, value: string): JustifiRequest {
    this.headers[key] = value;

    return this;
  }

  withQueryParam(key: string, value: string): JustifiRequest {
    if (!value) {
      return this;
    }

    this.requestUrl.searchParams.append(key, value);

    return this;
  }

  withQueryParams(params: object): JustifiRequest {
    if (!params) {
      return this;
    }

    Object.entries(toSnakeCase(params)).forEach(([key, value]) => {
      this.withQueryParam(key, value as string);
    });

    return this;
  }

  withBody(body: any): JustifiRequest {
    this.body = toSnakeCase(body);

    return this;
  }

  withAuth(token: string): JustifiRequest {
    return this.withHeader("Authorization", ` Bearer ${token}`);
  }

  withIdempotencyKey(idempotencyKey: string): JustifiRequest {
    return this.withHeader("Idempotency-Key", idempotencyKey);
  }

  async execute<T>(): Promise<ApiResponse<T>> {
    return new Promise((resolve, reject) => {
      const req = request(
        this.requestUrl,
        { method: this.method, headers: this.headers },
        (res) => {
          let body = "";
          res.on("data", (chunk) => (body += chunk));
          res.on("end", () => {
            const status = res.statusCode || 500;
            if (status >= 300) {
              return reject(errorFromHttpStatus(status, body));
            }

            try {
              const result = toCamelCase(JSON.parse(body));
              const apiResponseSchema: ApiResponseSchema<T> = {
                id: result.id || -1,
                type: result.type || "any",
                data: result.data || result,
                pageInfo: result.pageInfo || {},
              };

              return resolve(
                new ApiResponse(apiResponseSchema).withRequest(this)
              );
            } catch (e) {
              return reject(
                new InternalError({
                  code: 500,
                  message: "Failed to request resource: " + (e as string),
                })
              );
            }
          });
        }
      );

      req.on("error", (err) =>
        reject(new InternalError({ code: 500, message: err.message }))
      );

      if (this.body) {
        req.write(JSON.stringify(this.body));
      }

      req.end();
    });
  }

  async executeWithRetry<T>(
    retries: number = this.maxRetries
  ): Promise<ApiResponse<T>> {
    return this.retryExecute(retries, []);
  }

  private async retryExecute<T>(
    retries: number,
    errors: BaseError[]
  ): Promise<ApiResponse<T>> {
    if (retries === 0) {
      return Promise.reject(errors);
    }

    try {
      const result = await this.execute<T>();

      return Promise.resolve(result);
    } catch (e: any) {
      if (e instanceof InternalError) {
        errors.push(e);
        return this.retryExecute(retries - 1, errors);
      }

      return Promise.reject(e);
    }
  }

  private getApiHost(): string {
    if (process.env.JUSTIFI_API_URL) {
      return process.env.JUSTIFI_API_URL;
    }

    return "https://api.justifi.ai";
  }
}
