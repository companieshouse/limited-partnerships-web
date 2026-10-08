import request from "supertest";

import app from "../../app";
import { appDevDependencies } from "../../../../../config/dev-dependencies";
import { getUrl, setLocalesEnabled, testTranslations } from "../../../utils";

import { enTranslationText, cyTranslationText } from "../../../../../test/utils/locales";

import { ADD_PERSON_WITH_SIGNIFICANT_CONTROL_PROTECTED_INDIVIDUAL_PERSON_CONFIRM_URL } from "../../../../controller/registration/url";

import TransactionBuilder from "../../../builder/TransactionBuilder";
import LimitedPartnershipBuilder from "../../../builder/LimitedPartnershipBuilder";
import TransactionLimitedPartnership from "../../../../../domain/entities/TransactionLimitedPartnership";

describe("Add Protected Person With Significant Control Individual Person Page", () => {
  const URL = getUrl(ADD_PERSON_WITH_SIGNIFICANT_CONTROL_PROTECTED_INDIVIDUAL_PERSON_CONFIRM_URL);

  let limitedPartnership: TransactionLimitedPartnership;

  beforeEach(() => {
    setLocalesEnabled(false);

    const transaction = new TransactionBuilder().build();
    appDevDependencies.transactionGateway.feedTransactions([transaction]);

    limitedPartnership = new LimitedPartnershipBuilder().build();
    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

    appDevDependencies.personWithSignificantControlGateway.feedPersonsWithSignificantControl([]);
    appDevDependencies.personWithSignificantControlGateway.feedErrors(null);
  });

  describe("Get Add Individual Person Page", () => {
    it.each([
      ["English", "en", enTranslationText],
      ["Welsh", "cy", cyTranslationText]
    ])(
      "should load the add protectetd individual person page with %s text",
      async (description: string, lang: string, translationText: any) => {
        setLocalesEnabled(true);
        const res = await request(app).get(`${URL}?lang=${lang}`);

        expect(res.status).toBe(200);

        expect(res.text).toContain(
          `${translationText.personWithSignificantControl.addPersonWithSignificantControl.addProtectedIndividualPersonConfirm.title} - ${translationText.serviceRegistration} - GOV.UK`
        );

        testTranslations(res.text, translationText.personWithSignificantControl.addPersonWithSignificantControl, [
          "addOtherRegistrablePerson",
          "addRelevantLegalEntity",
          "addIndividualPerson",
          "commonEntityFields"
        ]);

        expect(res.text).toContain(limitedPartnership.data?.partnership_name?.toLocaleUpperCase());
        expect(res.text).toContain(limitedPartnership.data?.name_ending?.toLocaleUpperCase());
      }
    );
  });
});
