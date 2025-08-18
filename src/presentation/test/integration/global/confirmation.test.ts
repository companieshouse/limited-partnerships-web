import request from "supertest";

import app from "../app";
import enTranslationText from "../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../locales/cy/translations.json";

import { CONFIRMATION_URL } from "../../../controller/global/url";
import { getUrl, setLocalesEnabled, testTranslations } from "../../utils";
import { appDevDependencies } from "../../../../config/dev-dependencies";
import LimitedPartnershipBuilder from "../../builder/LimitedPartnershipBuilder";
import { JOURNEY_TYPE_PARAM } from "../../../../config";
import { Journey } from "../../../../domain/entities/journey";

describe("Confirmation Page", () => {
  const REGISTRATION_URL = getUrl(CONFIRMATION_URL).replace(JOURNEY_TYPE_PARAM, Journey.registration);
  const TRANSITION_URL = getUrl(CONFIRMATION_URL).replace(JOURNEY_TYPE_PARAM, Journey.transition);

  let limitedPartnership;

  beforeEach(() => {
    setLocalesEnabled(true);

    limitedPartnership = new LimitedPartnershipBuilder().build();
    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);
  });

  describe("GET /confirmation", () => {
    describe("English", () => {
      it("should load confirmation page - registration", async () => {
        const res = await request(app).get(REGISTRATION_URL);

        expect(res.status).toBe(200);

        testTranslations(res.text, enTranslationText.confirmationPage, [
          "provideMoreInformation",
          "tellUsAboutPSCs",
          "download",
          "filing",
          "processUpdate",
          "willSendEmailTo",
          "updatePublicRegister",
          "postTransition"
        ]);

        expect(res.text).toContain(limitedPartnership.data?.email);
        expect(res.text).toContain(appDevDependencies.transactionGateway.transactionId);
      });

      it("should load confirmation page - transition", async () => {
        const res = await request(app).get(TRANSITION_URL);

        expect(res.status).toBe(200);

        testTranslations(res.text, enTranslationText.confirmationPage, [
          "sentEmailTo",
          "applicationProcess",
          "willEmail",
          "applicationAcceptedOrRejected",
          "accepted",
          "rejected",
          "postTransition"
        ]);

        expect(res.text).toContain(limitedPartnership.data?.email);
        expect(res.text).toContain(appDevDependencies.transactionGateway.transactionId);
        expect(res.text).toContain(limitedPartnership.data?.partnership_name?.toUpperCase());
      });
    });
  });

  describe("Welsh", () => {
    it("should load confirmation page - registration", async () => {
      const res = await request(app).get(REGISTRATION_URL + "?lang=cy");

      expect(res.status).toBe(200);

      testTranslations(res.text, cyTranslationText.confirmationPage, [
        "provideMoreInformation",
        "tellUsAboutPSCs",
        "download",
        "filing",
        "processUpdate",
        "willSendEmailTo",
        "updatePublicRegister",
        "postTransition"
      ]);

      expect(res.text).toContain(limitedPartnership.data?.email);
    });

    it("should load confirmation page - transition", async () => {
      const res = await request(app).get(TRANSITION_URL + "?lang=cy");

      expect(res.status).toBe(200);

      testTranslations(res.text, cyTranslationText.confirmationPage, [
        "sentEmailTo",
        "applicationProcess",
        "willEmail",
        "applicationAcceptedOrRejected",
        "accepted",
        "rejected",
        "postTransition"
      ]);

      expect(res.text).toContain(limitedPartnership.data?.email);
      expect(res.text).toContain(appDevDependencies.transactionGateway.transactionId);
      expect(res.text).toContain(limitedPartnership.data?.partnership_name?.toUpperCase());
    });
  });
});
