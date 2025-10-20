import { CreateCheckoutSession } from "../../lib/internal/checkout_session";
import { paymentIntent1 } from "./payment_intent";

export const createCheckoutSessionResponse = {
  checkoutSessionId: "ddcaa057f0bbdaaf19cb16600acc1e687964e164fb9ae934b6960862371bb0fe"
};

export const createCheckoutSession: CreateCheckoutSession = {
  paymentIntentId: paymentIntent1.id,
  afterPaymentUrl: "http://localhost/after/payment",
  backUrl: "http://localhost/back"
}
