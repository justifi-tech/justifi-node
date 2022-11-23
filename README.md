# Justifi Node SDK

The JustiFi Node SDK provides a simple way to access JustiFi API for apps written in NodeJS. It includes a pre-defined set of modules and classes that are essentially wrapped versions of our API resources.

## Installation
```bash
# using npm
npm install @justifi/justifi-node

# using yarn
yarn add @justifi/justifi-node
```

## Using the SDK
To get started all you need to do is instantiate the JustiFi client providing your credentials

```javascript
import Justifi from "@justifi/justifi-node"

const client = Justifi.client().withCredentials({
  clientId: "<your_client_id>",
  clientSecret: "<your_client_secret>"
});
```

After that is done you can call any of the api methods provided as needed, you can take a look at the [examples](https://github.com/justifi-tech/justifi-node/tree/main/examples) directory to see in more detail 
how to use the different methods.

## Examples

**Creating a payment**
```javascript
const sellerAccountId = "your_seller_account_id";
const paymentParams = {
  amount: 1000,
  currency: "usd",
  capture_strategy: PaymentCaptureStrategy.automatic,
  email: "example@example.com",
  description: "Charging $10 on Example.com",
  payment_method: {
    card: {
      name: "JustiFi Tester",
      number: "4242424242424242",
      verification: "123",
      month: "3",
      year: "2040",
      address_postal_code: "55555"
    }
  }
};

client.createPayment(randomUUID(), paymentParams, sellerAccountId)
```

**Listing Payments**
```javascript
const sellerAccountId = "your_seller_account_id";
// Without filters
client.listPayments(undefined, sellerAccountId)

// With filters
client.listPayments({
  paymentStatus: PaymentStatus.pending,
  createdAfter: "2022-01-01T10:00:00.000Z"
}, sellerAccountId)
```

**Refund Payment**
```javascript
const sellerAccountId = "your_seller_account_id";
const paymentId = "your_payment_id";

client.refundPayment(randomUUID(), paymentId, {
  amount: 500,
  description: "Product is broken",
  reason: RefundReason.CustomerRequest,
  metadata: { customerId: "12345" },
})
```

## Recommendations
**Don't use this sdk directly in your front-end**

By using it directly in your front-end you will expose your credentials, it's recommended that you add the sdk to your back-end and use it to proxy the 
requests from the front-end.

**One instance for the entire application**

By having a single instance for your entire app you can take advantage of the caching provided by the sdk which stores your access token allowing the sdk to 
only authenticate your user once throughout the execution of the program or when token expires whichever comes first.
