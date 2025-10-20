import Justifi from "../lib";
import { getCredentials } from "./auth_token";

const client = Justifi.client().withCredentials(getCredentials());

if (process.argv.length < 3) {
  console.log("Request name argument is required");
  process.exit(1);
}

switch (process.argv[2]) {
  case "createCheckoutSession":
    client
      .createCheckoutSession({
        paymentIntentId: "<payment_intent_id>",
        afterPaymentUrl: "http://localhost/after/payment",
        backUrl: "http://localhost/back"
      })
      .then(console.log)
      .catch(console.log);
    break;

  default:
    break;
}
