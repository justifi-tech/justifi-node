import {
  AccountStatus,
  createSellerAccount,
  getSellerAccount,
  listSellerAccounts,
  SellerAccount,
  SellerAccountApi,
} from "./account";
import { AccessToken, Authenticator, Credential, getAccessToken } from "./auth";
import { InMemoryStore } from "./store";

export class Justifi implements Authenticator, SellerAccountApi {
  private static instance: Justifi;

  private credential: Credential;
  private store: InMemoryStore<AccessToken>;

  private ACCESS_TOKEN_STORE_KEY = "access_token";

  private constructor() {
    this.credential = { clientId: "", clientSecret: "" };
    this.store = new InMemoryStore();
  }

  public static client(): Justifi {
    if (!Justifi.instance) {
      Justifi.instance = new Justifi();
    }

    return Justifi.instance;
  }

  withCredentials(credential: Credential): Justifi {
    this.credential = credential;

    return this;
  }

  async getToken(): Promise<AccessToken> {
    try {
      const cachedToken = this.store.get(this.ACCESS_TOKEN_STORE_KEY);

      return Promise.resolve(cachedToken);
    } catch {
      const token = await getAccessToken(this.credential);
      this.store.add(
        this.ACCESS_TOKEN_STORE_KEY,
        token,
        this.tokenExpiration()
      );

      return Promise.resolve(token);
    }
  }

  async createSellerAccount(accountName: string): Promise<SellerAccount> {
    const token = await this.getToken();
    const res = await createSellerAccount(token.accessToken, accountName);

    return Promise.resolve(res.data);
  }

  async listSellerAccounts(
    status?: AccountStatus | undefined
  ): Promise<SellerAccount[]> {
    const token = await this.getToken();
    const res = await listSellerAccounts(token.accessToken, status);

    return Promise.resolve(res.data);
  }

  async getSellerAccount(id: string): Promise<SellerAccount> {
    const token = await this.getToken();
    const res = await getSellerAccount(token.accessToken, id);

    return Promise.resolve(res.data);
  }

  private tokenExpiration(): Date {
    const now = new Date();
    const halfADay = 12 * 60 * 60 * 1000;
    return new Date(now.getTime() + halfADay);
  }
}
