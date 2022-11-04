import { errorFromHttpStatus, InternalError } from "./error";

enum Environment {
  Staging = "staging",
  Production = "production",
}

export enum RequestMethod {
  Get = "GET",
  Post = "POST",
  Patch = "PATCH",
}

export type RequestHeaders = { [key: string]: string };

const getApiHost = (): string => {
  if (process.env.ENV === Environment.Production) {
    return "https://api.justifi.ai";
  }

  return "https://api.justifi-staging.com";
};

export const makeRequest = async <T>(
  method: RequestMethod,
  path: string,
  headers?: RequestHeaders,
  body?: any
): Promise<T> => {
  const requestUrl = getApiHost() + path;
  try {
    const res = await fetch(requestUrl, {
      method,
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify(body),
    });

    if (res.status >= 300) {
      const err = await res.text();
      return Promise.reject(errorFromHttpStatus(res.status, err));
    }

    return (await res.json()) as T;
  } catch (e: any) {
    return Promise.reject(
      new InternalError({
        code: 500,
        message: "Failed to request resource: " + e,
      })
    );
  }
};
