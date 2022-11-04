class BaseError {
  code: number;
  message: string;

  constructor({ code, message }: { code: number; message: string }) {
    this.code = code;
    this.message = message;
  }
}

export class NotFound extends BaseError {}
export class InvalidParameters extends BaseError {}
export class Unauthorized extends BaseError {}
export class InternalError extends BaseError {}
export class StoreKeyExpired extends BaseError {}

export const errorFromHttpStatus = (
  status: number,
  message: string
): BaseError => {
  const err = {
    code: status,
    message,
  };

  switch (status) {
    case 404:
      return new NotFound(err);
    case 403:
    case 401:
      return new Unauthorized(err);
    case 404:
      return new NotFound(err);
    default:
      return new InternalError(err);
  }
};
