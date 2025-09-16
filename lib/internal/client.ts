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
import { Business, BusinessApi, createBusiness, EntityBusiness, CreateEntityBusinessPayload, UpdateEntityBusinessPayload, EntityBusinessListFilters, EntityBusinessApi, createEntityBusiness, listEntityBusinesses, getEntityBusiness, updateEntityBusiness } from "./business";
import { CheckoutApi, Checkout, CreateCheckoutPayload, CompleteCheckoutPayload, completeCheckout, createCheckout, getCheckout, listCheckouts, updateCheckout } from "./checkout";
import { EntityAddress, CreateEntityAddressPayload, UpdateEntityAddressPayload, EntityAddressListFilters, EntityAddressApi, createEntityAddress, listEntityAddresses, getEntityAddress, updateEntityAddress } from "./address";
import { EntityBankAccount, CreateEntityBankAccountPayload, EntityBankAccountListFilters, EntityBankAccountApi, createEntityBankAccount, listEntityBankAccounts, getEntityBankAccount } from "./bank_account";
import { EntityDocument, CreateEntityDocumentPayload, EntityDocumentListFilters, EntityDocumentApi, createEntityDocument, listEntityDocuments, getEntityDocument } from "./document";
import { EntityIdentity, CreateEntityIdentityPayload, UpdateEntityIdentityPayload, EntityIdentityListFilters, EntityIdentityApi, createEntityIdentity, listEntityIdentities, getEntityIdentity, updateEntityIdentity } from "./identity";
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
  BusinessApi,
  EntityAddressApi,
  EntityBankAccountApi,
  EntityBusinessApi,
  EntityDocumentApi,
  EntityIdentityApi {
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


  /**
   * Generates a web component token for client-side operations.
   * 
   * @endpoint POST /v1/web_component_tokens
   * @param resources - List of resources the token should have access to
   * @returns Promise resolving to the web component token
   * @see https://docs.justifi.tech/infrastructure/webComponentTokens
   */
  async getWebComponentToken(resources: string[]): Promise<AccessToken> {
    const token = await this.getToken();
    return getWebComponentToken(token.accessToken, resources);
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

  /**
   * Lists sub-accounts with optional status filtering.
   * 
   * @endpoint GET /v1/sub_accounts
   * @param status - Optional status filter: "created", "submitted", "information_needed", "enabled", "rejected", "disabled", "archived"
   * @returns Promise resolving to array of sub-accounts
   */
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

  /**
   * Retrieves a sub-account by its ID.
   * 
   * @endpoint GET /v1/sub_accounts/{id}
   * @param id - The sub-account ID to retrieve
   * @returns Promise resolving to the sub-account details
   */
  async getSubAccount(id: string): Promise<ApiResponse<SubAccount>> {
    const token = await this.getToken();
    return getSubAccount(token.accessToken, id);
  }

  /**
   * Lists refunds with optional sub-account filtering.
   * 
   * @endpoint GET /v1/refunds
   * @param subAccountId - Optional sub-account to scope the refunds to
   * @returns Promise resolving to array of refunds
   */
  async listRefunds(
    subAccountId?: string | undefined
  ): Promise<ApiResponse<Refund[]>> {
    const token = await this.getToken();
    return listRefunds(token.accessToken, subAccountId);
  }

  /**
   * Retrieves a refund by its ID.
   * 
   * @endpoint GET /v1/refunds/{id}
   * @param id - The refund ID to retrieve
   * @returns Promise resolving to the refund details
   */
  async getRefund(id: string): Promise<ApiResponse<Refund>> {
    const token = await this.getToken();
    return getRefund(token.accessToken, id);
  }

  /**
   * Updates a refund with metadata.
   * 
   * @endpoint PATCH /v1/refunds/{id}
   * @param id - The refund ID to update
   * @param metadata - Metadata to attach to the refund
   * @param idempotencyKey - Unique key to prevent duplicate updates
   * @returns Promise resolving to the updated refund
   */
  async updateRefund(
    id: string,
    metadata: any,
    idempotencyKey: string
  ): Promise<ApiResponse<Refund>> {
    const token = await this.getToken();
    return updateRefund(token.accessToken, id, metadata, idempotencyKey);
  }

  /**
   * Creates a payment intent for deferred payment processing.
   * 
   * @endpoint POST /v1/payment_intents
   * @param idempotencyKey - Unique key to prevent duplicate payment intents
   * @param payload - Payment intent creation data
   * @param subAccountId - Optional sub-account to scope the payment intent to
   * @returns Promise resolving to the created payment intent
   */
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

  /**
   * Lists payment intents with optional sub-account filtering.
   * 
   * @endpoint GET /v1/payment_intents
   * @param subAccountId - Optional sub-account to scope the payment intents to
   * @returns Promise resolving to array of payment intents
   */
  async listPaymentIntents(
    subAccountId?: string
  ): Promise<ApiResponse<PaymentIntent[]>> {
    const token = await this.getToken();
    return listPaymentIntents(token.accessToken, subAccountId);
  }

  /**
   * Retrieves a payment intent by its ID.
   * 
   * @endpoint GET /v1/payment_intents/{id}
   * @param id - The payment intent ID to retrieve
   * @returns Promise resolving to the payment intent details
   */
  async getPaymentIntent(id: string): Promise<ApiResponse<PaymentIntent>> {
    const token = await this.getToken();
    return getPaymentIntent(token.accessToken, id);
  }

  /**
   * Updates a payment intent with new information.
   * 
   * @endpoint PATCH /v1/payment_intents/{id}
   * @param id - The payment intent ID to update
   * @param idempotencyKey - Unique key to prevent duplicate updates
   * @param payload - Payment intent update data
   * @returns Promise resolving to the updated payment intent
   */
  async updatePaymentIntent(
    id: string,
    idempotencyKey: string,
    payload: PaymentIntentUpdatePayload
  ): Promise<ApiResponse<PaymentIntent>> {
    const token = await this.getToken();
    return updatePaymentIntent(token.accessToken, id, idempotencyKey, payload);
  }

  /**
   * Captures a payment intent to complete the payment.
   * 
   * @endpoint POST /v1/payment_intents/{id}/capture
   * @param id - The payment intent ID to capture
   * @param idempotencyKey - Unique key to prevent duplicate captures
   * @param payload - Payment capture data
   * @returns Promise resolving to the captured payment intent
   */
  async capturePaymentIntent(
    id: string,
    idempotencyKey: string,
    payload: PaymentIntentCapturePayload
  ): Promise<ApiResponse<PaymentIntent>> {
    const token = await this.getToken();
    return capturePaymentIntent(token.accessToken, id, idempotencyKey, payload);
  }

  /**
   * Lists payments associated with a payment intent.
   * 
   * @endpoint GET /v1/payment_intents/{id}/payments
   * @param id - The payment intent ID to get payments for
   * @returns Promise resolving to array of payments
   */
  async listPaymentsForPaymentIntent(
    id: string
  ): Promise<ApiResponse<Payment[]>> {
    const token = await this.getToken();
    return listPaymentsForPaymentIntent(token.accessToken, id);
  }

  /**
   * Creates a new payment with the specified amount and payment method.
   * 
   * @endpoint POST /v1/payments
   * @param idempotencyKey - Unique key to prevent duplicate payments
   * @param payload - Payment details including amount and payment method
   * @param subAccountId - Optional sub-account to scope the payment to
   * @returns Promise resolving to the created payment
   */
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

  /**
   * Lists payments with optional filtering.
   * 
   * @endpoint GET /v1/payments
   * @param filters - Optional filters for payment list
   * @param subAccountId - Optional sub-account to scope the payments to
   * @returns Promise resolving to array of payments
   */
  async listPayments(
    filters?: PaymentListFilters | undefined,
    subAccountId?: string | undefined
  ): Promise<ApiResponse<Payment[]>> {
    const token = await this.getToken();
    return listPayments(token.accessToken, filters, subAccountId);
  }

  /**
   * Retrieves a payment by its ID.
   * 
   * @endpoint GET /v1/payments/{id}
   * @param id - The payment ID to retrieve
   * @returns Promise resolving to the payment details
   */
  async getPayment(id: string): Promise<ApiResponse<Payment>> {
    const token = await this.getToken();
    return getPayment(token.accessToken, id);
  }

  /**
   * Updates a payment with new information.
   * 
   * @endpoint PATCH /v1/payments/{id}
   * @param idempotencyKey - Unique key to prevent duplicate updates
   * @param id - The payment ID to update
   * @param payload - Payment update data
   * @returns Promise resolving to the updated payment
   */
  async updatePayment(
    idempotencyKey: string,
    id: string,
    payload: UpdatePaymentPayload
  ): Promise<ApiResponse<Payment>> {
    const token = await this.getToken();
    return updatePayment(token.accessToken, idempotencyKey, id, payload);
  }

  /**
   * Captures an authorized payment.
   * 
   * @endpoint POST /v1/payments/{id}/capture
   * @param idempotencyKey - Unique key to prevent duplicate captures
   * @param id - The payment ID to capture
   * @returns Promise resolving to the captured payment
   */
  async capturePayment(
    idempotencyKey: string,
    id: string
  ): Promise<ApiResponse<Payment>> {
    const token = await this.getToken();
    return capturePayment(token.accessToken, idempotencyKey, id);
  }

  /**
   * Creates a refund for a payment.
   * 
   * @endpoint POST /v1/payments/{id}/refunds
   * @param idempotencyKey - Unique key to prevent duplicate refunds
   * @param id - The payment ID to refund
   * @param payload - Refund details including amount and reason
   * @returns Promise resolving to the created refund
   */
  async refundPayment(
    idempotencyKey: string,
    id: string,
    payload: RefundPaymentPayload
  ): Promise<ApiResponse<Refund>> {
    const token = await this.getToken();
    return refundPayment(token.accessToken, idempotencyKey, id, payload);
  }

  /**
   * Retrieves balance transactions for a specific payment.
   * 
   * @endpoint GET /v1/payments/{payment_id}/payment_balance_transactions
   * @param paymentId - The payment ID to get balance transactions for
   * @returns Promise resolving to array of balance transactions
   */
  async getBalanceTransactions(
    paymentId: string
  ): Promise<ApiResponse<PaymentBalanceTransaction[]>> {
    const token = await this.getToken();
    return getBalanceTransactions(token.accessToken, paymentId);
  }

  /**
   * Creates a new payment method for storing customer payment information.
   * 
   * @endpoint POST /v1/payment_methods
   * @param payload - Payment method details (card, bank account, etc.)
   * @param idempotencyKey - Unique key to prevent duplicate payment methods
   * @param subAccountId - Optional sub-account to scope the payment method to
   * @returns Promise resolving to the created payment method
   */
  async createPaymentMethod(
    payload: CreatePaymentMethod,
    idempotencyKey: string,
    subAccountId?: string
  ): Promise<ApiResponse<PaymentMethods>> {
    const token = await this.getToken();
    return createPaymentMethod(token.accessToken, payload, idempotencyKey, subAccountId);
  }

  /**
   * Lists payment methods with optional filtering.
   * 
   * @endpoint GET /v1/payment_methods
   * @param subAccountId - Optional sub-account to scope the payment methods to
   * @param customerId - Optional customer ID to filter payment methods
   * @returns Promise resolving to array of payment methods
   */
  async listPaymentMethods(
    subAccountId?: string,
    customerId?: string,
  ): Promise<ApiResponse<PaymentMethods[]>> {
    const token = await this.getToken();
    return listPaymentMethods(token.accessToken, subAccountId, customerId);
  }

  /**
   * Retrieves a payment method by its token.
   * 
   * @endpoint GET /v1/payment_methods/{token}
   * @param paymentMethodToken - The payment method token to retrieve
   * @returns Promise resolving to the payment method details
   */
  async getPaymentMethod(
    paymentMethodToken: string
  ): Promise<ApiResponse<PaymentMethods>> {
    const token = await this.getToken();
    return getPaymentMethod(token.accessToken, paymentMethodToken);
  }

  /**
   * Updates a payment method with new information.
   * 
   * @endpoint PATCH /v1/payment_methods/{token}
   * @param payload - Updated payment method data
   * @param paymentMethodToken - The payment method token to update
   * @param idempotencyKey - Unique key to prevent duplicate updates
   * @returns Promise resolving to the updated payment method
   */
  async updatePaymentMethod(
    payload: UpdatePaymentMethod,
    paymentMethodToken: string,
    idempotencyKey: string
  ): Promise<ApiResponse<PaymentMethods>> {
    const token = await this.getToken();
    return updatePaymentMethod(token.accessToken, payload, paymentMethodToken, idempotencyKey)
  }

  /**
   * Lists disputes with optional sub-account filtering.
   * 
   * @endpoint GET /v1/disputes
   * @param subAccountId - Optional sub-account to scope the disputes to
   * @returns Promise resolving to array of disputes
   */
  async listDisputes(subAccountId?: string): Promise<ApiResponse<Dispute>> {
    const token = await this.getToken();
    return listDisputes(token.accessToken, subAccountId);
  }

  /**
   * Retrieves a dispute by its ID.
   * 
   * @endpoint GET /v1/disputes/{id}
   * @param id - The dispute ID to retrieve
   * @returns Promise resolving to the dispute details
   */
  async getDispute(id: string): Promise<ApiResponse<Dispute>> {
    const token = await this.getToken();
    return getDispute(token.accessToken, id);
  }

  /**
   * Updates a dispute with new information or evidence.
   * 
   * @endpoint PATCH /v1/disputes/{id}
   * @param id - The dispute ID to update
   * @param idempotencyKey - Unique key to prevent duplicate updates
   * @param payload - Dispute update data
   * @returns Promise resolving to the updated dispute
   */
  async updateDispute(id: string, idempotencyKey: string, payload: UpdateDispute): Promise<ApiResponse<Dispute>> {
    const token = await this.getToken();
    return updateDispute(token.accessToken, id, idempotencyKey, payload);
  }
  /**
   * Lists payouts with optional filtering.
   * 
   * @endpoint GET /v1/payouts
   * @param filters - Optional filters for payout list
   * @returns Promise resolving to array of payouts
   */
  async listPayouts(filters?: PayoutFilter): Promise<ApiResponse<Payout[]>> {
    const token = await this.getToken();
    return listPayouts(token.accessToken, filters);
  }

  /**
   * Retrieves a payout by its ID.
   * 
   * @endpoint GET /v1/payouts/{id}
   * @param id - The payout ID to retrieve
   * @returns Promise resolving to the payout details
   */
  async getPayout(id: string): Promise<ApiResponse<Payout>> {
    const token = await this.getToken();
    return getPayout(token.accessToken, id);
  }

  /**
   * Updates a payout with new information.
   * 
   * @endpoint PATCH /v1/payouts/{id}
   * @param id - The payout ID to update
   * @param idempotencyKey - Unique key to prevent duplicate updates
   * @param payload - Payout update data
   * @returns Promise resolving to the updated payout
   */
  async updatePayout(
    id: string,
    idempotencyKey: string,
    payload: UpdatePayout
  ): Promise<ApiResponse<Payout>> {
    const token = await this.getToken();
    return updatePayout(token.accessToken, id, idempotencyKey, payload);
  }
  /**
   * Lists balance transactions with optional payout filtering.
   * 
   * @endpoint GET /v1/balance_transactions
   * @param payoutId - Optional payout ID to filter balance transactions
   * @returns Promise resolving to array of balance transactions
   */
  async listBalanceTransactions(payoutId?: string): Promise<ApiResponse<BalanceTransaction[]>> {
    const token = await this.getToken();
    return listBalanceTransactions(token.accessToken, payoutId)
  }

  /**
   * Retrieves a balance transaction by its ID.
   * 
   * @endpoint GET /v1/balance_transactions/{id}
   * @param id - The balance transaction ID to retrieve
   * @returns Promise resolving to the balance transaction details
   */
  async getBalanceTransaction(id: string): Promise<ApiResponse<BalanceTransaction>> {
    const token = await this.getToken();
    return getBalanceTransaction(token.accessToken, id);
  }

  /**
   * Creates a new checkout session.
   * 
   * @endpoint POST /v1/checkout_sessions
   * @param payload - Checkout session creation data
   * @returns Promise resolving to the created checkout session
   */
  async createCheckoutSession(payload: CreateCheckoutSession): Promise<ApiResponse<CreateCheckoutSessionResponse>> {
    const token = await this.getToken();
    return createCheckoutSession(token.accessToken, payload);
  }

  /**
   * Provisions a product for a business.
   * 
   * @endpoint POST /v1/entities/provisioning
   * @param payload - Product provisioning data
   * @returns Promise resolving to the provisioning response
   */
  async provisionProduct(payload: ProvisionProductPayload): Promise<ApiResponse<ProvisionProductResponse>> {
    const token = await this.getToken();
    return provisionProduct(token.accessToken, payload);
  }

  /**
   * Creates a new business entity.
   * 
   * @endpoint POST /v1/entities/business
   * @param legalName - The legal name of the business
   * @returns Promise resolving to the created business
   */
  async createBusiness(legalName: string): Promise<ApiResponse<Business>> {
    const token = await this.getToken();

    return createBusiness(token.accessToken, legalName);
  }

  /**
   * Creates a new checkout.
   * 
   * @endpoint POST /v1/checkouts
   * @param payload - Checkout creation data
   * @param subAccountId - Optional sub-account to scope the checkout to
   * @returns Promise resolving to the created checkout
   */
  async createCheckout(payload: CreateCheckoutPayload, subAccountId?: string): Promise<ApiResponse<Checkout>> {
    const token = await this.getToken();

    return createCheckout(token.accessToken, payload, subAccountId);
  }

  /**
   * Lists checkouts with optional sub-account filtering.
   * 
   * @endpoint GET /v1/checkouts
   * @param subAccountId - Optional sub-account to scope the checkouts to
   * @returns Promise resolving to array of checkouts
   */
  async listCheckouts(
    subAccountId?: string | undefined
  ): Promise<ApiResponse<Checkout[]>> {
    const token = await this.getToken();
    return listCheckouts(token.accessToken, subAccountId);
  }

  /**
   * Retrieves a checkout by its ID.
   * 
   * @endpoint GET /v1/checkouts/{id}
   * @param id - The checkout ID to retrieve
   * @returns Promise resolving to the checkout details
   */
  async getCheckout(id: string): Promise<ApiResponse<Checkout>> {
    const token = await this.getToken();
    return getCheckout(token.accessToken, id);
  }

  /**
   * Updates a checkout with new information.
   * 
   * @endpoint PATCH /v1/checkouts/{id}
   * @param id - The checkout ID to update
   * @param amount - Optional new amount
   * @param description - Optional new description
   * @returns Promise resolving to the updated checkout
   */
  async updateCheckout(
    id: string,
    amount?: number,
    description?: string
  ): Promise<ApiResponse<Checkout>> {
    const token = await this.getToken();
    return updateCheckout(token.accessToken, id, amount, description);
  }

  /**
   * Completes a checkout by processing the payment.
   * 
   * @endpoint POST /v1/checkouts/{id}/complete
   * @param id - The checkout ID to complete
   * @param idempotencyKey - Unique key to prevent duplicate completions
   * @param payload - Checkout completion data
   * @returns Promise resolving to the completed checkout
   */
  async completeCheckout(
    id: string,
    idempotencyKey: string,
    payload: CompleteCheckoutPayload,
  ): Promise<ApiResponse<Checkout>> {
    const token = await this.getToken();
    return completeCheckout(
      token.accessToken,
      id,
      idempotencyKey,
      payload
    );
  }

  // Entity Address Methods
  
  /**
   * Creates a new address.
   * 
   * @endpoint POST /v1/entities/address
   * @param payload - Address creation data
   * @returns Promise resolving to the created address
   */
  async createEntityAddress(payload: CreateEntityAddressPayload): Promise<ApiResponse<EntityAddress>> {
    const token = await this.getToken();
    return createEntityAddress(token.accessToken, payload);
  }

  /**
   * Lists all addresses with optional filtering.
   * 
   * @endpoint GET /v1/entities/address
   * @param filters - Optional filters for pagination and search
   * @returns Promise resolving to array of addresses
   */
  async listEntityAddresses(filters?: EntityAddressListFilters): Promise<ApiResponse<EntityAddress[]>> {
    const token = await this.getToken();
    return listEntityAddresses(token.accessToken, filters);
  }

  /**
   * Retrieves an address by its ID.
   * 
   * @endpoint GET /v1/entities/address/{id}
   * @param id - The address ID to retrieve
   * @returns Promise resolving to the address details
   */
  async getEntityAddress(id: string): Promise<ApiResponse<EntityAddress>> {
    const token = await this.getToken();
    return getEntityAddress(token.accessToken, id);
  }

  /**
   * Updates an address with new information.
   * 
   * @endpoint PATCH /v1/entities/address/{id}
   * @param id - The address ID to update
   * @param payload - Address update data
   * @returns Promise resolving to the updated address
   */
  async updateEntityAddress(id: string, payload: UpdateEntityAddressPayload): Promise<ApiResponse<EntityAddress>> {
    const token = await this.getToken();
    return updateEntityAddress(token.accessToken, id, payload);
  }

  // Entity Bank Account Methods

  /**
   * Creates a new bank account.
   * 
   * @endpoint POST /v1/entities/bank_accounts
   * @param payload - Bank account creation data
   * @returns Promise resolving to the created bank account
   */
  async createEntityBankAccount(payload: CreateEntityBankAccountPayload): Promise<ApiResponse<EntityBankAccount>> {
    const token = await this.getToken();
    return createEntityBankAccount(token.accessToken, payload);
  }

  /**
   * Lists all bank accounts with optional filtering.
   * 
   * @endpoint GET /v1/entities/bank_accounts
   * @param filters - Optional filters for pagination and search
   * @returns Promise resolving to array of bank accounts
   */
  async listEntityBankAccounts(filters?: EntityBankAccountListFilters): Promise<ApiResponse<EntityBankAccount[]>> {
    const token = await this.getToken();
    return listEntityBankAccounts(token.accessToken, filters);
  }

  /**
   * Retrieves a bank account by its ID.
   * 
   * @endpoint GET /v1/entities/bank_accounts/{id}
   * @param id - The bank account ID to retrieve
   * @returns Promise resolving to the bank account details
   */
  async getEntityBankAccount(id: string): Promise<ApiResponse<EntityBankAccount>> {
    const token = await this.getToken();
    return getEntityBankAccount(token.accessToken, id);
  }

  // Entity Business Methods

  /**
   * Creates a new business entity with full payload support.
   * 
   * @endpoint POST /v1/entities/business
   * @param payload - Business creation data
   * @returns Promise resolving to the created business
   */
  async createEntityBusiness(payload: CreateEntityBusinessPayload): Promise<ApiResponse<EntityBusiness>> {
    const token = await this.getToken();
    return createEntityBusiness(token.accessToken, payload);
  }

  /**
   * Lists all businesses with optional filtering.
   * 
   * @endpoint GET /v1/entities/business
   * @param filters - Optional filters for pagination and search
   * @returns Promise resolving to array of businesses
   */
  async listEntityBusinesses(filters?: EntityBusinessListFilters): Promise<ApiResponse<EntityBusiness[]>> {
    const token = await this.getToken();
    return listEntityBusinesses(token.accessToken, filters);
  }

  /**
   * Retrieves a business by its ID.
   * 
   * @endpoint GET /v1/entities/business/{id}
   * @param id - The business ID to retrieve
   * @returns Promise resolving to the business details
   */
  async getEntityBusiness(id: string): Promise<ApiResponse<EntityBusiness>> {
    const token = await this.getToken();
    return getEntityBusiness(token.accessToken, id);
  }

  /**
   * Updates a business with new information.
   * 
   * @endpoint PATCH /v1/entities/business/{id}
   * @param id - The business ID to update
   * @param payload - Business update data
   * @returns Promise resolving to the updated business
   */
  async updateEntityBusiness(id: string, payload: UpdateEntityBusinessPayload): Promise<ApiResponse<EntityBusiness>> {
    const token = await this.getToken();
    return updateEntityBusiness(token.accessToken, id, payload);
  }

  // Entity Document Methods

  /**
   * Creates a new document.
   * 
   * @endpoint POST /v1/entities/document
   * @param payload - Document creation data
   * @returns Promise resolving to the created document
   */
  async createEntityDocument(payload: CreateEntityDocumentPayload): Promise<ApiResponse<EntityDocument>> {
    const token = await this.getToken();
    return createEntityDocument(token.accessToken, payload);
  }

  /**
   * Lists all documents with optional filtering.
   * 
   * @endpoint GET /v1/entities/document
   * @param filters - Optional filters for pagination and search
   * @returns Promise resolving to array of documents
   */
  async listEntityDocuments(filters?: EntityDocumentListFilters): Promise<ApiResponse<EntityDocument[]>> {
    const token = await this.getToken();
    return listEntityDocuments(token.accessToken, filters);
  }

  /**
   * Retrieves a document by its ID.
   * 
   * @endpoint GET /v1/entities/document/{id}
   * @param id - The document ID to retrieve
   * @returns Promise resolving to the document details
   */
  async getEntityDocument(id: string): Promise<ApiResponse<EntityDocument>> {
    const token = await this.getToken();
    return getEntityDocument(token.accessToken, id);
  }

  // Entity Identity Methods

  /**
   * Creates a new identity.
   * 
   * @endpoint POST /v1/entities/identity
   * @param payload - Identity creation data
   * @returns Promise resolving to the created identity
   */
  async createEntityIdentity(payload: CreateEntityIdentityPayload): Promise<ApiResponse<EntityIdentity>> {
    const token = await this.getToken();
    return createEntityIdentity(token.accessToken, payload);
  }

  /**
   * Lists all identities with optional filtering.
   * 
   * @endpoint GET /v1/entities/identity
   * @param filters - Optional filters for pagination and search
   * @returns Promise resolving to array of identities
   */
  async listEntityIdentities(filters?: EntityIdentityListFilters): Promise<ApiResponse<EntityIdentity[]>> {
    const token = await this.getToken();
    return listEntityIdentities(token.accessToken, filters);
  }

  /**
   * Retrieves an identity by its ID.
   * 
   * @endpoint GET /v1/entities/identity/{id}
   * @param id - The identity ID to retrieve
   * @returns Promise resolving to the identity details
   */
  async getEntityIdentity(id: string): Promise<ApiResponse<EntityIdentity>> {
    const token = await this.getToken();
    return getEntityIdentity(token.accessToken, id);
  }

  /**
   * Updates an identity with new information.
   * 
   * @endpoint PATCH /v1/entities/identity/{id}
   * @param id - The identity ID to update
   * @param payload - Identity update data
   * @returns Promise resolving to the updated identity
   */
  async updateEntityIdentity(id: string, payload: UpdateEntityIdentityPayload): Promise<ApiResponse<EntityIdentity>> {
    const token = await this.getToken();
    return updateEntityIdentity(token.accessToken, id, payload);
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
