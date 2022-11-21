import Justifi from "../lib";
import { PaymentCaptureStrategy, PaymentStatus } from "../lib/internal/payment";
import { RefundReason } from "../lib/internal/refund";
import { getCredentials } from "./auth_token";

const client = Justifi.client().withCredentials(getCredentials());

if (process.argv.length < 3) {
  console.log("Request name argument is required");
  process.exit(1);
}

switch (process.argv[2]) {
  case "createPayment":
    client
      .createPayment(
        "<idempotency_key>",
        {
          amount: 1234,
          currency: "usd",
          captureStrategy: PaymentCaptureStrategy.Automatic,
          email: "someone@somewhere.com",
          applicationFeeAmount: 123,
          description: "Some cool product",
          metadata: {},
          paymentMethod: {
            card: {
              name: "Sample Card",
              number: "4242424242424242",
              verification: "123",
              month: "12",
              year: "2030",
              addressLine1: "Sample Street",
              addressLine2: "",
              addressCity: "Sample City",
              addressState: "SC",
              addressPostalCode: "0123456",
              addressCountry: "SC",
              brand: "Sample Brand",
              metadata: {},
            },
          },
        },
        "<seller_account_id>"
      )
      .then(console.log)
      .catch(console.log);
    break;

  case "listPaymentsNoFilters":
    client
      .listPayments(undefined, "<seller_account_id>")
      .then(console.log)
      .catch(console.log);
    break;

  case "listPaymentsWithFilters":
    client
      .listPayments(
        {
          createdBefore: "2022-12-30T21:27:50.190Z",
          createdAfter: "2022-01-01T00:00:00.000Z",
          paymentStatus: PaymentStatus.Succeeded,
        },
        "<seller_account_id>"
      )
      .then(console.log)
      .catch(console.log);
    break;

  case "getPayment":
    client.getPayment("<payment_id>").then(console.log).catch(console.log);
    break;

  case "updatePayment":
    client
      .updatePayment("<idempotency_key>", "<payment_id>", {
        description: "any description",
        metadata: { any: { data: "you want" } },
      })
      .then(console.log)
      .catch(console.log);
    break;

  case "capturePayment":
    client
      .capturePayment("<idempotency_key>", "<payment_id>")
      .then(console.log)
      .catch(console.log);
    break;

  case "refundPayment":
    client
      .refundPayment("<idempotency_key>", "<payment_id>", {
        amount: 1234,
        description: "woops purchase",
        reason: RefundReason.CustomerRequest,
        metadata: { any: { data: "you want" } },
      })
      .then(console.log)
      .catch(console.log);
    break;

  case "getBalanceTransactions":
    client
      .getBalanceTransactions("<payment_id>")
      .then(console.log)
      .catch(console.log);
    break;

  default:
    break;
}
