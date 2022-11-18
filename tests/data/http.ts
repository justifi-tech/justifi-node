import { randomInt } from "crypto";
import { ApiResponse } from "../../lib/http";

export const withApiResponse = <T>(
  data: T,
  endCursor?: string,
  startCursor?: string
): ApiResponse<T> => {
  return new ApiResponse<T>(randomInt(100), "any", data, {
    endCursor: endCursor || "",
    startCursor: startCursor || "",
    hasPrevious: Boolean(startCursor),
    hasNext: Boolean(endCursor),
  });
};
