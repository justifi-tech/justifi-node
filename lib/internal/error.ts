export class BaseError {
  code: number;
  message: string;

  constructor({ code, message }: { code: number; message: string }) {
    this.code = code;
    this.message = message;
  }
}

export class NotFound extends BaseError {
  constructor(message: string) {
    super({ code: 404, message });
  }
}
export class Unauthorized extends BaseError {
  constructor(message: string) {
    super({ code: 403, message });
  }
}
export class Unauthenticated extends BaseError {
  constructor(message: string) {
    super({ code: 401, message });
  }
}
export class PaginationError extends BaseError {
  constructor(message: string) {
    super({ code: 400, message });
  }
}
export class BadRequestError extends BaseError {
  constructor(message: string) {
    super({ code: 400, message })
  }
}
export class StoreKeyExpired extends BaseError {
  constructor(message: string) {
    super({ code: 500, message });
  }
}
export class InternalError extends BaseError { }

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
      return new NotFound(err.message);
    case 403:
      return new Unauthorized(err.message);
    case 401:
      return new Unauthenticated(err.message);
    case 400:
      return new BadRequestError(err.message);
    default:
      return new InternalError(err);
  }
};
