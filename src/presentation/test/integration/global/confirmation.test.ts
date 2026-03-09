import request from "supertest";

import app from "../app";
import enTranslationText from "../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../locales/cy/translations.json";

import { CONFIRMATION_URL } from "../../../controller/global/url";
import { countOccurrences, getUrl, setLocalesEnabled, testTranslations } from "../../utils";
import { appDevDependencies } from "../../../../config/dev-dependencies";
import LimitedPartnershipBuilder from "../../builder/LimitedPartnershipBuilder";
import { JOURNEY_TYPE_PARAM } from "../../../../config";
import { Journey } from "../../../../domain/entities/journey";

jest.mock("../../../../utils/session", () => ({
  getLoggedInUserEmail: (_session) => "test@example.com"
}));

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
    it.each([
      [REGISTRATION_URL, "en"],
      [REGISTRATION_URL, "cy"],
      [TRANSITION_URL, "en"],
      [TRANSITION_URL, "cy"]
    ])("should load confirmation page - registration - %s", async (url: string, lang: string) => {
      const translationText = lang === "en" ? enTranslationText : cyTranslationText;

      const res = await request(app).get(`${url}?lang=${lang}`);

      expect(res.status).toBe(200);

      testTranslations(
        res.text,
        translationText.confirmationPage,
        url === REGISTRATION_URL ? excludedKeysRegistartion : excludedKeysTransition
      );

      if (url === TRANSITION_URL) {
        expect(res.text).toContain(limitedPartnership.data?.partnership_name?.toUpperCase());
      }

      expect(countOccurrences(res.text, "test@example.com")).toBe(3);
      expect(res.text).toContain(appDevDependencies.transactionGateway.transactionId);

      expect(res.text).toContain(translationText.print.buttonText);
      expect(res.text).toContain(translationText.print.buttonTextNoJs);
      expect(res.text).not.toContain(translationText.confirmationPage.postTransition.title);
    });
  });
});

const excludedKeysRegistartion = [
  "provideMoreInformation",
  "tellUsAboutPSCs",
  "download",
  "filing",
  "processUpdate",
  "willSendEmailTo",
  "updatePublicRegister",
  "postTransition"
];

const excludedKeysTransition = [
  "sentEmailTo",
  "applicationProcess",
  "willEmail",
  "applicationAcceptedOrRejected",
  "accepted",
  "rejected",
  "postTransition"
];
