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
  BalanceTransaction,
  capturePayment,
  createPayment,
  CreatePaymentPayload,
  getBalanceTransactions,
  getPayment,
  listPayments,
  Payment,
  PaymentApi,
  PaymentListFilters,
  refundPayment,
  RefundPaymentPayload,
  updatePayment,
  UpdatePaymentPayload,
} from "./payment";
import {
  capturePaymentIntent,
  createPaymentIntent,
  getPaymentIntent,
  listPaymentIntents,
  listPaymentsForPaymentIntent,
  PaymentIntent,
  PaymentIntentApi,
  PaymentIntentCapturePayload,
  PaymentIntentCreatePayload,
  PaymentIntentUpdatePayload,
  updatePaymentIntent,
} from "./payment_intent";
import {
  getRefund,
  listRefunds,
  Refund,
  RefundApi,
  updateRefund,
} from "./refund";
import { InMemoryStore } from "./store";

export class Justifi
  implements
    Authenticator,
    SellerAccountApi,
    RefundApi,
    PaymentIntentApi,
    PaymentApi
{
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

  async createPaymentIntent(
    idempotencyKey: string,
    payload: PaymentIntentCreatePayload,
    sellerAccountId?: string
  ): Promise<ApiResponse<PaymentIntent>> {
    const token = await this.getToken();
    return createPaymentIntent(
      token.accessToken,
      idempotencyKey,
      payload,
      sellerAccountId
    );
  }

  async listPaymentIntents(
    sellerAccountId?: string
  ): Promise<ApiResponse<PaymentIntent[]>> {
    const token = await this.getToken();
    return listPaymentIntents(token.accessToken, sellerAccountId);
  }

  async getPaymentIntent(id: string): Promise<ApiResponse<PaymentIntent>> {
    const token = await this.getToken();
    return getPaymentIntent(token.accessToken, id);
  }

  async updatePaymentIntent(
    id: string,
    idempotencyKey: string,
    payload: PaymentIntentUpdatePayload
  ): Promise<ApiResponse<PaymentIntent>> {
    const token = await this.getToken();
    return updatePaymentIntent(token.accessToken, id, idempotencyKey, payload);
  }

  async capturePaymentIntent(
    id: string,
    idempotencyKey: string,
    payload: PaymentIntentCapturePayload
  ): Promise<ApiResponse<PaymentIntent>> {
    const token = await this.getToken();
    return capturePaymentIntent(token.accessToken, id, idempotencyKey, payload);
  }

  async listPaymentsForPaymentIntent(
    id: string
  ): Promise<ApiResponse<Payment>> {
    const token = await this.getToken();
    return listPaymentsForPaymentIntent(token.accessToken, id);
  }

  async createPayment(
    idempotencyKey: string,
    payload: CreatePaymentPayload,
    sellerAccountId?: string | undefined
  ): Promise<ApiResponse<Payment>> {
    const token = await this.getToken();
    return createPayment(
      token.accessToken,
      idempotencyKey,
      payload,
      sellerAccountId
    );
  }

  async listPayments(
    sellerAccountId?: string | undefined,
    filters?: PaymentListFilters | undefined
  ): Promise<ApiResponse<Payment[]>> {
    const token = await this.getToken();
    return listPayments(token.accessToken, sellerAccountId, filters);
  }

  async getPayment(id: string): Promise<ApiResponse<Payment>> {
    const token = await this.getToken();
    return getPayment(token.accessToken, id);
  }

  async updatePayment(
    idempotencyKey: string,
    id: string,
    payload: UpdatePaymentPayload
  ): Promise<ApiResponse<Payment>> {
    const token = await this.getToken();
    return updatePayment(token.accessToken, idempotencyKey, id, payload);
  }

  async capturePayment(
    idempotencyKey: string,
    id: string
  ): Promise<ApiResponse<Payment>> {
    const token = await this.getToken();
    return capturePayment(token.accessToken, idempotencyKey, id);
  }

  async refundPayment(
    idempotencyKey: string,
    id: string,
    payload: RefundPaymentPayload
  ): Promise<ApiResponse<Refund>> {
    const token = await this.getToken();
    return refundPayment(token.accessToken, idempotencyKey, id, payload);
  }

  async getBalanceTransactions(
    id: string
  ): Promise<ApiResponse<BalanceTransaction[]>> {
    const token = await this.getToken();
    return getBalanceTransactions(token.accessToken, id);
  }

  private tokenExpiration(): Date {
    const now = new Date();
    const halfADay = 12 * 60 * 60 * 1000;
    return new Date(now.getTime() + halfADay);
  }
}
