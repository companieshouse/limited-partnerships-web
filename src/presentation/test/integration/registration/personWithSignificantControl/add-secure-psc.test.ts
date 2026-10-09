import request from "supertest";
import app from "../../app";
import { appDevDependencies } from "../../../../../config/dev-dependencies";
import { getUrl, setLocalesEnabled, testTranslations } from "../../../utils";

import {
  ADD_PERSON_WITH_SIGNIFICANT_CONTROL_INDIVIDUAL_PERSON_URL,
  DOES_INDIVIDUAL_PERSON_REQUIRE_PROTECTION_URL,
  PERSON_WITH_SIGNIFICANT_CONTROL_CHOICE_URL
} from "presentation/controller/registration/url";

import TransactionBuilder from "presentation/test/builder/TransactionBuilder";
import LimitedPartnershipBuilder from "presentation/test/builder/LimitedPartnershipBuilder";
import { enTranslationText, cyTranslationText } from "../../../../../test/utils/locales";
import RegistrationPageType from "presentation/controller/registration/PageType";
describe("Add Person with Significant Control Secure Individual Page", () => {

  const URL = getUrl(DOES_INDIVIDUAL_PERSON_REQUIRE_PROTECTION_URL);
  const REDIRECT_NON_SECURE_URL = getUrl(ADD_PERSON_WITH_SIGNIFICANT_CONTROL_INDIVIDUAL_PERSON_URL);
  // TODO - Update REDIRECT_SECURE_URL placeholder with the correct secure individual PSC URL
  const REDIRECT_SECURE_URL = getUrl(ADD_PERSON_WITH_SIGNIFICANT_CONTROL_INDIVIDUAL_PERSON_URL);

  beforeEach(() => {
    setLocalesEnabled(false);

    const transaction = new TransactionBuilder().build();
    appDevDependencies.transactionGateway.feedTransactions([transaction]);

    const limitedPartnership = new LimitedPartnershipBuilder().build();
    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

    appDevDependencies.personWithSignificantControlGateway.feedPersonsWithSignificantControl([]);
    appDevDependencies.personWithSignificantControlGateway.feedErrors(null);
  });

  describe("Get Does Individual Person Require Protection Page", () => {
    it.each([
      ["English", "en", enTranslationText],
      ["Welsh", "cy", cyTranslationText]
    ])(
      "should load the secure individual person page in %s",
      async (description: string, lang: string, translationText: any) => {
        setLocalesEnabled(true);
        const res = await request(app).get(`${URL}?lang=${lang}`);

        expect(res.status).toBe(200);

        expect(res.text).toContain(
          `${translationText.personWithSignificantControl.doesIndividualPscRequireProtection.title} - ${translationText.serviceRegistration} - GOV.UK`
        );

        testTranslations(res.text, translationText.personWithSignificantControl.doesIndividualPscRequireProtection, [
          "errorMessage"
        ]);
      });

    it("should contain a back link to the choice page", async () => {
      const res = await request(app).get(URL);

      const BACK_LINK = getUrl(PERSON_WITH_SIGNIFICANT_CONTROL_CHOICE_URL);

      expect(res.status).toBe(200);

      expect(res.text).toContain(BACK_LINK);
    });
  });

  describe("Post Does Individual Person Require Protection Page", () => {
    it("should return an error when no selection is made", async() => {
      const res = await request(app).post(URL).send({
        pageType: RegistrationPageType.doesIndividualPscRequireProtection,
        parameter: ""
      });

      expect(res.status).toBe(200);

      expect(res.text).toContain(enTranslationText.personWithSignificantControl.doesIndividualPscRequireProtection.errorMessage);
    });

    it.each([
      [
        "add secure psc",
        "SECURE_INDIVIDUAL_PSC",
        REDIRECT_SECURE_URL,
      ],
      [
        "add non secure psc",
        "NON_SECURE_INDIVIDUAL_PSC",
        REDIRECT_NON_SECURE_URL,
      ]
    ])(
      "should redirect to the %s page when %s option is selected",
      async (description: string, parameter: string, redirectUrl: string) => {
        const res = await request(app).post(URL).send({
          pageType: RegistrationPageType.personWithSignificantControlChoice,
          parameter
        });

        expect(res.status).toBe(302);

        expect(res.text).toContain(`Redirecting to ${redirectUrl}`);
      }
    );
  });

});
