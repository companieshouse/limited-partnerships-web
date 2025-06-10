import request from "supertest";

import app from "../app";
import enTranslationText from "../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../locales/cy/translations.json";

import { PAYMENT_FAILED_URL } from "../../../controller/global/url";
import { getUrl, setLocalesEnabled, testTranslations } from "../../utils";
import { JOURNEY_TYPE_PARAM } from "../../../../config";
import { Journey } from "../../../../domain/entities/journey";

describe("Payment Failed Page", () => {
  const REGISTRATION_URL = getUrl(PAYMENT_FAILED_URL).replace(JOURNEY_TYPE_PARAM, Journey.registration);
  const TRANSITION_URL = getUrl(PAYMENT_FAILED_URL).replace(JOURNEY_TYPE_PARAM, Journey.transition);

  beforeEach(() => {
    setLocalesEnabled(true);
  });

  describe("GET /payment-failed", () => {
    describe("English", () => {
      it("should load payment failed page - registration", async () => {
        const res = await request(app).get(REGISTRATION_URL);

        expect(res.status).toBe(200);

        testTranslations(res.text, enTranslationText.paymentFailedPage, ["retry"]);

        expect(res.text).not.toContain("Back");
      });

      it("should load payment failed page - transition", async () => {
        const res = await request(app).get(TRANSITION_URL);

        expect(res.status).toBe(200);

        testTranslations(res.text, enTranslationText.paymentFailedPage, ["retry"]);

        expect(res.text).not.toContain("Back");
      });
    });

    describe("Welsh", () => {
      it("should load payment failed page - registration", async () => {
        const res = await request(app).get(REGISTRATION_URL + "?lang=cy");

        expect(res.status).toBe(200);

        testTranslations(res.text, cyTranslationText.paymentFailedPage, ["retry"]);

        expect(res.text).not.toContain("Back");
      });

      it("should load payment failed page - transition", async () => {
        const res = await request(app).get(TRANSITION_URL + "?lang=cy");

        expect(res.status).toBe(200);

        testTranslations(res.text, cyTranslationText.paymentFailedPage, ["retry"]);

        expect(res.text).not.toContain("Back");
      });
    });
  });
});
