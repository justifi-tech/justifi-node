import { randomUUID } from "crypto";
import Justifi from "../lib";
import { getCredentials } from "./auth_token";

const client = Justifi.client().withCredentials(getCredentials());

if (process.argv.length < 3) {
  console.log("Request name argument is required");
  process.exit(1);
}

switch (process.argv[2]) {
  case "createPaymentMethod":
    client
      .createPaymentMethod(
        {
          paymentMethod: {
            card: {
              name: "Sylvia Fowles",
              number: "4242424242424242",
              verification: "123",
              month: "3",
              year: "2040",
              addressPostalCode: "55555",
              metadata: {
                "some": "extra_data"
              }
            },
          },
        },
        randomUUID(),
      )
      .then(console.log)
      .catch(console.log);
    break;

  case "listPaymentMethods":
    client
      .listPaymentMethods()
      .then(console.log)
      .catch(console.log);
    break;

  case "getPaymentMethod":
    client
      .getPaymentMethod("<payment_method_token>")
      .then(console.log)
      .catch(console.log);
    break;

  case "updatePaymentMethod":
    client
      .updatePaymentMethod(
        {
          card: {
            metadata: {
              "something": "updated"
            }
          },
        },
        "<payment_method_token>",
        randomUUID(),
      )
      .then(console.log)
      .catch(console.log);
    break;

  default:
    break;
}
