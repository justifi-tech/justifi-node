import { randomInt } from "crypto";
import { ApiResponse } from "../../lib/http";

export const withApiResponse = <T>(
  data: T,
  endCursor?: string,
  startCursor?: string
): ApiResponse<T> => {
  return new ApiResponse<T>({
    id: randomInt(100),
    type: "any",
    data,
    pageInfo: {
      endCursor: endCursor || "",
      startCursor: startCursor || "",
      hasPrevious: Boolean(startCursor),
      hasNext: Boolean(endCursor),
    },
  });
};
