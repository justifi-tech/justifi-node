import { request, RequestOptions } from "https";
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
    return "api.justifi.ai";
  }

  return "api.justifi.ai";
};

export const makeRequest = <T>(
  method: RequestMethod,
  path: string,
  headers?: RequestHeaders,
  body?: any
): Promise<T> => {
  const options: RequestOptions = { host: getApiHost(), path, method, headers };

  return new Promise((resolve, reject) => {
    let req = request(options, (res) => {
      let data: Uint8Array[] = [];

      const code = res.statusCode || 500;
      if (code >= 300) {
        return reject(
          errorFromHttpStatus(code, JSON.parse(Buffer.concat(data).toString()))
        );
      }

      res.on("data", (chunk) => data.push(chunk));
      res.on("close", () => {
        try {
          const json: T = JSON.parse(Buffer.concat(data).toString());
          return resolve(json);
        } catch {
          Promise.reject(
            new InternalError({
              code: 500,
              message: "Failed to parse response body",
            })
          );
        }
      });

      res.on("error", (err) =>
        reject(new InternalError({ code, message: err.message }))
      );
    });

    req.on(
      "error",
      (err) => new InternalError({ code: 500, message: err.message })
    );

    if (body) {
      req.write(JSON.parse(body));
    }

    req.end();
  });
};
