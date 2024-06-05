import {
  AccountStatus,
  createSellerAccount,
  getSellerAccount,
  listSellerAccounts,
  SellerAccount,
  SellerAccountApi,
  createSubAccount,
  getSubAccount,
  listSubAccounts,
  SubAccount,
  SubAccountApi,
} from "./account";
import { AccessToken, Authenticator, Credential, getAccessToken, getWebComponentToken } from "./auth";
import { Dispute, DisputeApi, getDispute, listDisputes, updateDispute, UpdateDispute } from "./disputes";
import { BalanceTransaction, BalanceTransactionApi, getBalanceTransaction, listBalanceTransactions } from "./balance_transactions";
import { ApiResponse } from "./http";
import {
  PaymentBalanceTransaction,
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
import { getPayout, listPayouts, Payout, PayoutApi, PayoutFilter, updatePayout, UpdatePayout } from "./payout";
import {
  CreatePaymentMethod,
  createPaymentMethod,
  getPaymentMethod,
  listPaymentMethods,
  PaymentMethodApi,
  PaymentMethods,
  updatePaymentMethod,
  UpdatePaymentMethod,
} from "./payment_method";
import {
  getRefund,
  listRefunds,
  Refund,
  RefundApi,
  updateRefund,
} from "./refund";
import { InMemoryStore } from "./store";
import { verifySignature, WebhookVerifier } from "./webhook";
import { CheckoutSessionApi, createCheckoutSession, CreateCheckoutSession, CreateCheckoutSessionResponse } from "./checkout_session"
import { ProvisioningApi, ProvisionProductPayload, provisionProduct, ProvisionProductResponse } from "./provisioning";
import { Business, BusinessApi, createBusiness } from "./business";
import { CheckoutApi, Checkout, getCheckout, listCheckouts, updateCheckout } from "./checkout"
export class Justifi
  implements
  Authenticator,
  SellerAccountApi,
  SubAccountApi,
  RefundApi,
  PaymentMethodApi,
  PaymentIntentApi,
  PaymentApi,
  DisputeApi,
  PayoutApi,
  BalanceTransactionApi,
  PaymentIntentApi,
  PaymentApi,
  CheckoutSessionApi,
  WebhookVerifier,
  ProvisioningApi,
  CheckoutApi,
  BusinessApi {
  private static instance: Justifi;

  private credential: Credential;
  private store: InMemoryStore<AccessToken>;

  private ACCESS_TOKEN_STORE_KEY = "access_token";
  private WEB_COMPONENT_TOKEN_STORE_KEY = "web_component_token";

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

  clearCache() {
    this.store.clear();
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

  async getWCToken(token: string, checkoutId: string, accountId: string): Promise<AccessToken> {
    try {
      const cachedToken = this.store.get(this.WEB_COMPONENT_TOKEN_STORE_KEY);

      return Promise.resolve(cachedToken);
    } catch {
      const wcToken = await getWebComponentToken(token, checkoutId, accountId);
      this.store.add(
        this.WEB_COMPONENT_TOKEN_STORE_KEY,
        wcToken,
        this.tokenExpiration()
      );

      return Promise.resolve(wcToken);
    }
  }

  /**
   * @deprecated seller account has been deprecated, please use sub account
   * @deprecated createSellerAccount has been deprecated. please use provision product
   */
  async createSellerAccount(
    accountName: string
  ): Promise<ApiResponse<SellerAccount>> {
    const token = await this.getToken();
    return createSellerAccount(token.accessToken, accountName);
  }

  /**
   * @deprecated createSubAccount has been deprecated. please use provision product
   */
  async createSubAccount(
    accountName: string
  ): Promise<ApiResponse<SubAccount>> {
    const token = await this.getToken();
    return createSubAccount(token.accessToken, accountName);
  }

  /**
  * @deprecated seller account has been deprecated, please use sub account
  */
  async listSellerAccounts(
    status?: AccountStatus | undefined
  ): Promise<ApiResponse<SellerAccount[]>> {
    const token = await this.getToken();
    return listSellerAccounts(token.accessToken, status);
  }

  async listSubAccounts(
    status?: AccountStatus | undefined
  ): Promise<ApiResponse<SubAccount[]>> {
    const token = await this.getToken();
    return listSubAccounts(token.accessToken, status);
  }

  /**
  * @deprecated seller account has been deprecated, please use sub account
  */
  async getSellerAccount(id: string): Promise<ApiResponse<SellerAccount>> {
    const token = await this.getToken();
    return getSellerAccount(token.accessToken, id);
  }

  async getSubAccount(id: string): Promise<ApiResponse<SubAccount>> {
    const token = await this.getToken();
    return getSubAccount(token.accessToken, id);
  }

  async listRefunds(
    subAccountId?: string | undefined
  ): Promise<ApiResponse<Refund[]>> {
    const token = await this.getToken();
    return listRefunds(token.accessToken, subAccountId);
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
    subAccountId?: string
  ): Promise<ApiResponse<PaymentIntent>> {
    const token = await this.getToken();
    return createPaymentIntent(
      token.accessToken,
      idempotencyKey,
      payload,
      subAccountId
    );
  }

  async listPaymentIntents(
    subAccountId?: string
  ): Promise<ApiResponse<PaymentIntent[]>> {
    const token = await this.getToken();
    return listPaymentIntents(token.accessToken, subAccountId);
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
  ): Promise<ApiResponse<Payment[]>> {
    const token = await this.getToken();
    return listPaymentsForPaymentIntent(token.accessToken, id);
  }

  async createPayment(
    idempotencyKey: string,
    payload: CreatePaymentPayload,
    subAccountId?: string | undefined
  ): Promise<ApiResponse<Payment>> {
    const token = await this.getToken();
    return createPayment(
      token.accessToken,
      idempotencyKey,
      payload,
      subAccountId
    );
  }

  async listPayments(
    filters?: PaymentListFilters | undefined,
    subAccountId?: string | undefined
  ): Promise<ApiResponse<Payment[]>> {
    const token = await this.getToken();
    return listPayments(token.accessToken, filters, subAccountId);
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
    paymentId: string
  ): Promise<ApiResponse<PaymentBalanceTransaction[]>> {
    const token = await this.getToken();
    return getBalanceTransactions(token.accessToken, paymentId);
  }

  async createPaymentMethod(
    payload: CreatePaymentMethod,
    idempotencyKey: string,
    subAccountId?: string
  ): Promise<ApiResponse<PaymentMethods>> {
    const token = await this.getToken();
    return createPaymentMethod(token.accessToken, payload, idempotencyKey, subAccountId);
  }

  async listPaymentMethods(
    subAccountId?: string,
    customerId?: string,
  ): Promise<ApiResponse<PaymentMethods[]>> {
    const token = await this.getToken();
    return listPaymentMethods(token.accessToken, subAccountId, customerId);
  }

  async getPaymentMethod(
    paymentMethodToken: string
  ): Promise<ApiResponse<PaymentMethods>> {
    const token = await this.getToken();
    return getPaymentMethod(token.accessToken, paymentMethodToken);
  }

  async updatePaymentMethod(
    payload: UpdatePaymentMethod,
    paymentMethodToken: string,
    idempotencyKey: string
  ): Promise<ApiResponse<PaymentMethods>> {
    const token = await this.getToken();
    return updatePaymentMethod(token.accessToken, payload, paymentMethodToken, idempotencyKey)
  }

  async listDisputes(subAccountId?: string): Promise<ApiResponse<Dispute>> {
    const token = await this.getToken();
    return listDisputes(token.accessToken, subAccountId);
  }

  async getDispute(id: string): Promise<ApiResponse<Dispute>> {
    const token = await this.getToken();
    return getDispute(token.accessToken, id);
  }

  async updateDispute(id: string, idempotencyKey: string, payload: UpdateDispute): Promise<ApiResponse<Dispute>> {
    const token = await this.getToken();
    return updateDispute(token.accessToken, id, idempotencyKey, payload);
  }
  async listPayouts(filters?: PayoutFilter): Promise<ApiResponse<Payout[]>> {
    const token = await this.getToken();
    return listPayouts(token.accessToken, filters);
  }

  async getPayout(id: string): Promise<ApiResponse<Payout>> {
    const token = await this.getToken();
    return getPayout(token.accessToken, id);
  }

  async updatePayout(
    id: string,
    idempotencyKey: string,
    payload: UpdatePayout
  ): Promise<ApiResponse<Payout>> {
    const token = await this.getToken();
    return updatePayout(token.accessToken, id, idempotencyKey, payload);
  }
  async listBalanceTransactions(payoutId?: string): Promise<ApiResponse<BalanceTransaction[]>> {
    const token = await this.getToken();
    return listBalanceTransactions(token.accessToken, payoutId)
  }

  async getBalanceTransaction(id: string): Promise<ApiResponse<BalanceTransaction>> {
    const token = await this.getToken();
    return getBalanceTransaction(token.accessToken, id);
  }

  async createCheckoutSession(payload: CreateCheckoutSession): Promise<ApiResponse<CreateCheckoutSessionResponse>> {
    const token = await this.getToken();
    return createCheckoutSession(token.accessToken, payload);
  }

  async provisionProduct(payload: ProvisionProductPayload): Promise<ApiResponse<ProvisionProductResponse>> {
    const token = await this.getToken();
    return provisionProduct(token.accessToken, payload);
  }

  async createBusiness(legalName: string): Promise<ApiResponse<Business>> {
    const token = await this.getToken();

    return createBusiness(token.accessToken, legalName);
  }

  async listCheckouts(
    sellerAccountId?: string | undefined
  ): Promise<ApiResponse<Checkout[]>> {
    const token = await this.getToken();
    return listCheckouts(token.accessToken, sellerAccountId);
  }

  async getCheckout(id: string): Promise<ApiResponse<Checkout>> {
    const token = await this.getToken();
    return getCheckout(token.accessToken, id);
  }

  async updateCheckout(
    id: string,
    amount: number,
    description: string
  ): Promise<ApiResponse<Checkout>> {
    const token = await this.getToken();
    return updateCheckout(token.accessToken, id, amount, description);
  }

  verifySignature(
    receivedEvent: any,
    timestamp: string,
    secretKey: string,
    signature: string
  ): boolean {
    return verifySignature(receivedEvent, timestamp, secretKey, signature);
  }

  private tokenExpiration(): Date {
    const now = new Date();
    const halfADay = 12 * 60 * 60 * 1000;
    return new Date(now.getTime() + halfADay);
  }
}
