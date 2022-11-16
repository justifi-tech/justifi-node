import "jest";
import {
  errorFromHttpStatus,
  InternalError,
  NotFound,
  Unauthenticated,
  Unauthorized,
} from "../../lib/error";

describe("errors", () => {
  describe("when mapping http status to error", () => {
    it("returns not found error when status is 404", () => {
      const err = new NotFound({ code: 404, message: "resource not found" });
      expect(errorFromHttpStatus(err.code, err.message)).toEqual(err);
    });

    it("returns unauthrorized when status is 403", () => {
      const err = new Unauthorized({ code: 403, message: "unauthrorized" });
      expect(errorFromHttpStatus(err.code, err.message)).toEqual(err);
    });

    it("returns unauthenticated when status is 401", () => {
      const err = new Unauthenticated({
        code: 401,
        message: "unauthenticated",
      });
      expect(errorFromHttpStatus(err.code, err.message)).toEqual(err);
    });

    it("returns internal error when status is something else", () => {
      const err1 = new InternalError({ code: 500, message: "internal error" });
      expect(errorFromHttpStatus(err1.code, err1.message)).toEqual(err1);

      const err2 = new InternalError({ code: 301, message: "redirect" });
      expect(errorFromHttpStatus(err2.code, err2.message)).toEqual(err2);
    });
  });
});
