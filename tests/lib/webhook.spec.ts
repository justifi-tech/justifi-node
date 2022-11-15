import "jest";
import Justifi from "../../lib";
import { webhookReceivedEvent } from "../data/webhook";

describe("Webhook", () => {
  const credentials = {
    clientId: "some_client_id",
    clientSecret: "some_client_secret",
  };

  const client = Justifi.client().withCredentials(credentials);
  describe("verify signature", () => {
    describe("when signature is valid", () => {
      it("allows", () => {
        const valid = client.verifySignature(
          webhookReceivedEvent,
          "1668122947",
          "justifi-test-key",
          "d190761659ee22eb6eab46e23934565c48edd750ce44c939003e6dae070ada19"
        );

        expect(valid).toEqual(true);
      });
    });

    describe("when signature is invalid", () => {
      const valid = client.verifySignature(
        webhookReceivedEvent,
        "1668122947",
        "justifi-test-key",
        "invalid_signature"
      );

      expect(valid).toEqual(false);
    });
  });
});
