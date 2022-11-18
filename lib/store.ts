import { NotFound, StoreKeyExpired } from "./error";

interface Store<T> {
  data: { [key: string]: { expiration: Date; value: T } };
  add(key: string, value: T, expiration: Date): void;
  get(key: string): T;
  clear(): void;
}

export class InMemoryStore<T> implements Store<T> {
  data: { [key: string]: { expiration: Date; value: T } };

  public constructor() {
    this.data = {};
  }

  add(key: string, value: T, expiration: Date = new Date()): void {
    this.data[key] = { expiration, value };
  }

  get(key: string): T {
    if (this.isExpired(key)) {
      delete this.data[key];
      throw new StoreKeyExpired("Store key expired");
    }

    if (!this.data[key]) {
      throw new NotFound("Store key not found");
    }

    return this.data[key].value;
  }

  clear(): void {
    this.data = {};
  }

  private isExpired(key: string): boolean {
    const expiration = this.data[key].expiration;

    return new Date() > expiration;
  }
}
