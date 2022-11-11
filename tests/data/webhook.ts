export const webhookReceivedEvent = {
  id: "evt_123abc",
  account_id: "acc_123abc",
  account_type: "test",
  platform_account_id: "acc_123abc",
  idempotency_key: "3c972386-3exx-4fff-9baa-12345679fa27",
  request_id: null,
  version: "v1",
  data: {
    id: "py_abc123",
    account_id: "acc_abc123",
    amount_disputed: 0,
    amount_refunded: 0,
    amount_returned: 0,
    amount: 15152,
    amount_refundable: 15152,
    application_fee_rate_id: "afr_abc123",
    balance: 0,
    capture_strategy: "automatic",
    captured: true,
    created_at: "2022-11-10T23:29:06.802Z",
    currency: "usd",
    description: "Small Linen Lamp",
    disputed: false,
    error_code: null,
    error_description: null,
    fee_amount: 0,
    is_test: true,
    metadata: null,
    payment_intent_id: null,
    refunded: false,
    returned: false,
    status: "succeeded",
    updated_at: "2022-11-10T23:29:06.802Z",
    payment_method: {
      card: {
        id: "pm_abc123",
        acct_last_four: "4242",
        brand: "visa",
        name: "Nathalie Nikolaus I",
        token: "pm_abc123",
        metadata: null,
        created_at: "2022-11-10T23:29:06.787Z",
        updated_at: "2022-11-10T23:29:06.787Z",
      },
      customer_id: "cust_abc123",
      signature: "1209705q79jhafagow",
    },
    application_fee: null,
    refunds: [],
    disputes: [],
  },
  event_name: "payment.created",
};
