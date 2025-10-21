import { createHmac } from "crypto";

const ALGORITHM = "sha256";

export interface WebhookVerifier {
  verifySignature(
    receivedEvent: string | object,
    timestamp: string,
    secretKey: string,
    signature: string
  ): boolean;
}

export const verifySignature = (
  receivedEvent: string | any,
  timestamp: string,
  secretKey: string,
  signature: string
): boolean => {
  const receivedEventPayload = typeof receivedEvent === "string" ? receivedEvent : JSON.stringify(receivedEvent);
  const payload = `${timestamp}.${receivedEventPayload}`;
  const hex = createHmac(ALGORITHM, secretKey).update(payload).digest("hex");

  return signature === hex;
};
