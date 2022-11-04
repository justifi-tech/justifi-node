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

  if (status >= 400 && status < 500) {
    return new InvalidParameters(err);
  }

  return new InternalError(err);
};
