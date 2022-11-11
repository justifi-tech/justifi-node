import { Justifi } from "../lib/client";
import { getCredentials } from "./auth_token";

const client = Justifi.client().withCredentials(getCredentials());

if (process.argv.length < 3) {
  console.log("Request name argument is required");
  process.exit(1);
}

switch (process.argv[2]) {
  case "createPaymentIntent":
    client
      .createPaymentIntent(
        "<idempotency_key>",
        {
          amount: 1000,
          currency: "usd",
          description: "example payment intent",
          metadata: { any: { data: "you want" } },
          paymentMethod: {
            card: {
              name: "justifi node sdk",
              number: "4242424242424242",
              verification: "484",
              month: "12",
              year: "2030",
              addressLine1: "Sample Road",
              addressLine2: "",
              addressCity: "Sample City",
              addressState: "SC",
              addressPostalCode: "0123456",
              addressCountry: "SC",
              brand: "Sample brand",
              metadata: {},
            },
          },
        },
        "<seller_account_id>"
      )
      .then(console.log)
      .catch(console.log);
    break;

  case "listPaymentIntents":
    client
      .listPaymentIntents("<seller_account_id>")
      .then(console.log)
      .catch(console.log);
    break;

  case "getPaymentIntent":
    client
      .getPaymentIntent("<payment_intent_id>")
      .then(console.log)
      .catch(console.log);
    break;

  case "updatePaymentIntent":
    client
      .updatePaymentIntent("<payment_intent_id>", "<idempotency_key>", {
        description: "payment intent update example",
        metadata: { any: { data: "you want" } },
        paymentMethod: { token: "<payment_method_token>" },
      })
      .then(console.log)
      .catch(console.log);
    break;

  case "capturePaymentIntent":
    client
      .capturePaymentIntent("<payment_intent_id>", "<idempotency_key>", {
        paymentMethod: {
          token: "<payment_method_token>",
        },
      })
      .then(console.log)
      .catch(console.log);
    break;

  case "listPaymentsForPaymentIntent":
    client
      .listPaymentsForPaymentIntent("<payment_intent_id")
      .then(console.log)
      .catch(console.log);
    break;

  default:
    break;
}
