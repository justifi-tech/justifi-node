import Justifi from "../lib";
import { ProductCategory } from "../lib/internal/provisioning";
import { getCredentials } from "./auth_token";

const client = Justifi.client().withCredentials(getCredentials());

if (process.argv.length < 3) {
  console.log("Request name argument is required");
  process.exit(1);
}

switch (process.argv[2]) {
  case "provisionProduct":
    client
      .provisionProduct({
        newAccountName: "justifi node sdk provision",
        businessId: "biz_FGGxR1u7Z2qUeFwtzIZmH",
        productCategory: ProductCategory.Insurance
      })
      .then(console.log)
      .catch(console.log);
    break;
}
