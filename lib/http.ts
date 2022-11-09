import { toCamelCase, toSnakeCase } from "./converter";
import { errorFromHttpStatus, InternalError, BaseError } from "./error";

export interface PageInfo {
  endCursor: string;
  hasNext: boolean;
  hasPrevious: boolean;
  startCursor: boolean;
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

export class JustifiRequest {
  private maxRetries = 3;

  private requestUrl: URL;
  private method: RequestMethod;
  private headers: RequestHeaders;
  private body?: any;

  constructor(method: RequestMethod, path: string) {
    this.requestUrl = new URL(`${this.getApiHost()}/${path}`);
    this.method = method;
    this.headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
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

  withQueryParams(params: any): JustifiRequest {
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
    try {
      const res = await fetch(this.requestUrl, {
        method: this.method,
        headers: this.headers,
        body: this.body ? JSON.stringify(this.body) : undefined,
      });

      if (res.status >= 300) {
        const err = await res.text();
        return Promise.reject(errorFromHttpStatus(res.status, err));
      }

      const result = (await res.json()) as T;
      return toCamelCase(result);
    } catch (e: any) {
      return Promise.reject(
        new InternalError({
          code: 500,
          message: "Failed to request resource: " + e,
        })
      );
    }
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
      return this.retryExecute(retries--, errors);
    }
  }

  private getApiHost(): string {
    if (process.env.JUSTIFI_API_URL) {
      return process.env.JUSTIFI_API_URL;
    }

    return "https://api.justifi.ai";
  }
}
