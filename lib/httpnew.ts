import {toCamelCase} from "./converter";

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

  withBody(body: any): JustifiRequest {
    this.body = body;

    return this;
  }

  withAuth(token: string): JustifiRequest {
    return this.withHeader("Authorization", ` Bearer ${token}`)
  }

  async execute<T>(): Promise<T> {
    try {
      const res = await fetch(this.requestUrl, {
        method: this.method,
        headers: this.headers,
        body: this.body ? JSON.stringify(toCamelCase(this.body)) : undefined;
      })

      if (res.status >= 300) {
        const err = await res.text();
        return Promise.reject(errorFromHttpStatus(res.status, err))
      }

      return (await res.json()) as T;
    } catch(e: any) {
      return Promise.reject(new InternalError({
        code: 500,
        message: "Failed to request resource: " + e,
      }))
    }
  }

  async executeWithRetry<T>(retries: number = this.maxRetries): Promise<T> {
    return this.retryExecute(retries, [])
  }

  private retryExecute<T>(retries: number, errors: BaseError[]): Promise<T> {
    if (retries === 0) {
      return Promise.reject(errors)
    }

    try {
      const result = await this.execute<T>();

      return Promise.resolve(result);
    } catch (e: BaseError) {
      errors.push(e)
      return this.retryExecute(retries--, errors);
    }
  }

  private getApiHost(): string {
    if (process.env.JUSTIFI_STAGING_URL) {
      return process.env.JUSTIFI_STAGING_URL;
    }

    return "https://api.justifi.ai";
  }
}
