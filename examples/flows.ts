import Justifi from "../lib";
import { randomUUID } from "crypto";
import { SubAccount } from "../lib/internal/account";
import { PaymentCaptureStrategy } from "../lib/internal/payment";
import { PaymentMethodCard } from "../lib/internal/payment_method"
import { RefundReason } from "../lib/internal/refund";

if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET) {
  throw new Error("CLIENT_ID or CLIENT_SECRET missing");
}

const client = Justifi.client().withCredentials({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
});

const runSubAccountTest = async (): Promise<SubAccount> => {
  const subAccount = await client.createSubAccount(
    `justifi-node-test-${new Date().getTime()}`
  );
  console.log("sub account created");

  const subAccountList = await client.listSubAccounts();
  if (!subAccountList.data.find((acc) => acc.id === subAccount.data.id)) {
    throw new Error("could not find sub account when listing");
  }
  console.log("sub list fetched");

  await client.getSubAccount(subAccount.data.id);
  console.log("sub account found");

  const getEnabledAccount = await client.getSubAccount(
    "<enabled_account_id>"
  );
  console.log("enabled sub account found");

  return Promise.resolve(getEnabledAccount.data);
};

const runPaymentIntentTest = async (subAccount: SubAccount) => {
  const paymentIntent = await client.createPaymentIntent(
    randomUUID(),
    {
      amount: 1000,
      currency: "usd",
      paymentMethod: {
        card: {
          name: "test card",
          number: "5555555555554444",
          verification: "123",
          month: "12",
          year: "2030",
          addressPostalCode: "1234567890",
        },
      },
    },
    subAccount.id
  );
  console.log("payment intent created");

  const paymentIntentList = await client.listPaymentIntents(subAccount.id);
  if (!paymentIntentList.data.find((p) => p.id === paymentIntent.data.id)) {
    throw new Error("could not find payment intent when listing");
  }
  console.log("payment intent list fetched");

  await client.updatePaymentIntent(paymentIntent.data.id, randomUUID(), {
    metadata: { extra: "info" },
    description: "some product",
  });
  console.log("payment intent updated");

  const paymentIntentUpdateGet = await client.getPaymentIntent(
    paymentIntent.data.id
  );
  if (
    paymentIntentUpdateGet.data?.metadata?.extra !== "info" ||
    paymentIntentUpdateGet.data.description != "some product"
  ) {
    throw new Error("payment intent update failed");
  }
  console.log("payment intent update successfull");

  await client.capturePaymentIntent(paymentIntent.data.id, randomUUID(), {
    paymentMethod: {
      token: (paymentIntent.data.paymentMethod as PaymentMethodCard).card.token,
    },
  });
  console.log("payment intent captured");
};

const runPaymentTest = async (subAccount: SubAccount) => {
  const payment = await client.createPayment(
    randomUUID(),
    {
      amount: 1000,
      currency: "usd",
      captureStrategy: PaymentCaptureStrategy.Automatic,
      paymentMethod: {
        card: {
          name: "another card",
          number: "4242424242424242",
          verification: "321",
          month: "12",
          year: "30",
          addressPostalCode: "1234567890",
        },
      },
    },
    subAccount.id
  );
  console.log("payment created");

  const paymentList = await client.listPayments(undefined, subAccount.id);
  if (!paymentList.data.find((p) => p.id === payment.data.id)) {
    throw new Error("could not find payment when listing");
  }
  console.log("payment list fetched");

  await client.updatePayment(randomUUID(), payment.data.id, {
    description: "some product",
    metadata: { extra: "info" },
  });
  console.log("payment updated");

  const paymentUpdateGet = await client.getPayment(payment.data.id);
  if (
    paymentUpdateGet.data?.metadata?.extra !== "info" ||
    paymentUpdateGet.data.description !== "some product"
  ) {
    throw new Error("payment update failed ");
  }
  console.log("payment update successfull");

  await client.capturePayment(randomUUID(), payment.data.id);
  console.log("payment captured");

  await client.refundPayment(randomUUID(), payment.data.id, {
    amount: payment.data.amount,
    reason: RefundReason.CustomerRequest,
  });
  console.log("payment refunded");
};

const runRefundTest = async (subAccount: SubAccount) => {
  const refunds = await client.listRefunds(subAccount.id);
  if (refunds.data.length === 0) {
    throw new Error("No refunds found");
  }
  console.log("refund list fetched");

  await client.updateRefund(
    refunds.data[0].id,
    { extra: "info" },
    randomUUID()
  );
  console.log("refund updated");

  const updatedRefund = await client.getRefund(refunds.data[0].id);
  if (updatedRefund.data?.metadata.extra !== "info") {
    throw new Error("refund update failed");
  }
  console.log("refund update successfull");
};

runSubAccountTest()
  .then(async (acc) => {
    await runPaymentIntentTest(acc);
    await runPaymentTest(acc);
    await runRefundTest(acc);
  })
  .catch(console.log);
