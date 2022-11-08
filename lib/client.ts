import {
  AccountStatus,
  createSellerAccount,
  getSellerAccount,
  listSellerAccounts,
  SellerAccount,
  SellerAccountApi,
} from "./account";
import { AccessToken, Authenticator, Credential, getAccessToken } from "./auth";
import { ApiResponse } from "./http";
import {
  getRefund,
  listRefunds,
  Refund,
  RefundApi,
  updateRefund,
} from "./refund";
import { InMemoryStore } from "./store";

export class Justifi implements Authenticator, SellerAccountApi, RefundApi {
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

  async createSellerAccount(
    accountName: string
  ): Promise<ApiResponse<SellerAccount>> {
    const token = await this.getToken();
    return createSellerAccount(token.accessToken, accountName);
  }

  async listSellerAccounts(
    status?: AccountStatus | undefined
  ): Promise<ApiResponse<SellerAccount[]>> {
    const token = await this.getToken();
    return listSellerAccounts(token.accessToken, status);
  }

  async getSellerAccount(id: string): Promise<ApiResponse<SellerAccount>> {
    const token = await this.getToken();
    return getSellerAccount(token.accessToken, id);
  }

  async listRefunds(
    sellerAccountId?: string | undefined
  ): Promise<ApiResponse<Refund[]>> {
    const token = await this.getToken();
    return listRefunds(token.accessToken, sellerAccountId);
  }

  async getRefund(id: string): Promise<ApiResponse<Refund>> {
    const token = await this.getToken();
    return getRefund(token.accessToken, id);
  }

  async updateRefund(
    id: string,
    metadata: any,
    idempotencyKey: string
  ): Promise<ApiResponse<Refund>> {
    const token = await this.getToken();
    return updateRefund(token.accessToken, id, metadata, idempotencyKey);
  }

  private tokenExpiration(): Date {
    const now = new Date();
    const halfADay = 12 * 60 * 60 * 1000;
    return new Date(now.getTime() + halfADay);
  }
}
