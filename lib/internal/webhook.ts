import { createHmac } from "crypto";

const ALGORITHM = "sha256";

export interface WebhookVerifier {
  verifySignature(
    receivedEvent: any,
    timestamp: string,
    secretKey: string,
    signature: string
  ): boolean;
}

export const verifySignature = (
  receivedEvent: any,
  timestamp: string,
  secretKey: string,
  signature: string
): boolean => {
  const payload = `${timestamp}.${receivedEvent}`;
  const hex = createHmac(ALGORITHM, secretKey).update(payload).digest("hex");

  return signature === hex;
};
