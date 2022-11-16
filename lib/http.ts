import { OutgoingHttpHeaders } from "http";
import { request } from "https";
import { toCamelCase, toSnakeCase } from "./converter";
import { errorFromHttpStatus, InternalError, BaseError } from "./error";

export interface PageInfo {
  endCursor: string;
  startCursor: string;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface ApiResponse<T> {
  id: number;
  type: string;
  data: T;
  pageInfo: PageInfo;
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

  async execute<T>(): Promise<T> {
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
              return resolve(toCamelCase(JSON.parse(body)) as T);
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

  async executeWithRetry<T>(retries: number = this.maxRetries): Promise<T> {
    return this.retryExecute(retries, []);
  }

  private async retryExecute<T>(
    retries: number,
    errors: BaseError[]
  ): Promise<T> {
    if (retries === 0) {
      return Promise.reject(errors);
    }

    try {
      const result = await this.execute<T>();

      return Promise.resolve(result);
    } catch (e: any) {
      errors.push(e);
      return this.retryExecute(retries - 1, errors);
    }
  }

  private getApiHost(): string {
    if (process.env.JUSTIFI_API_URL) {
      return process.env.JUSTIFI_API_URL;
    }

    return "https://api.justifi.ai";
  }
}
