import { randomInt } from "crypto";
import { ApiResponse } from "../../lib/http";

export const withApiResponse = <T>(data: T): ApiResponse<T> => {
  return {
    id: randomInt(100),
    type: "any",
    pageInfo: {
      endCursor: "",
      startCursor: "",
      hasPrevious: false,
      hasNext: false,
    },
    data,
  };
};
