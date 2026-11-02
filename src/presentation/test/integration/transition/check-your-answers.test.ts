import request from "supertest";
import app from "../app";

import {
  GeneralPartner,
  LimitedPartner,
  PartnershipType
} from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";
import { CHECK_YOUR_ANSWERS_URL } from "../../../controller/transition/url";
import { appDevDependencies } from "../../../../config/dev-dependencies";
import LimitedPartnershipBuilder from "../../builder/LimitedPartnershipBuilder";
import { checkIfPartnerValuesInText, getUrl, checkYourAnswersPersonKeys, setLocalesEnabled, testTranslations, checkYourAnswersLegalEntityKeys } from "../../utils";
import GeneralPartnerBuilder from "../../builder/GeneralPartnerBuilder";
import LimitedPartnerBuilder from "../../builder/LimitedPartnerBuilder";
import { TransactionKind } from "../../../../domain/entities/TransactionTypes";
import TransactionBuilder from "../../builder/TransactionBuilder";
import TransitionPageType from "../../../controller/transition/PageType";
import { CONFIRMATION_URL } from "../../../controller/global/url";
import { JOURNEY_TYPE_PARAM } from "../../../../config/constants";
import { Journey } from "../../../../domain/entities/journey";
import { customerFeedbackUrlMap } from "../../../../middlewares/customer-feedback.middleware";
import { enTranslationText, cyTranslationText } from "../../../../test/utils/locales";
import TransactionLimitedPartnership from "../../../../domain/entities/TransactionLimitedPartnership";

describe("Check Your Answers Page", () => {
  const URL = getUrl(CHECK_YOUR_ANSWERS_URL);
  const REDIRECT_URL = getUrl(CONFIRMATION_URL).replace(JOURNEY_TYPE_PARAM, Journey.transition);

  let limitedPartnership: TransactionLimitedPartnership;
  let generalPartnerPerson: GeneralPartner;
  let generalPartnerLegalEntity: GeneralPartner;
  let limitedPartnerPerson: LimitedPartner;
  let limitedPartnerLegalEntity: LimitedPartner;

  beforeEach(() => {
    const transaction = new TransactionBuilder().withFilingMode(TransactionKind.transition).build();
    appDevDependencies.transactionGateway.feedTransactions([transaction]);

    limitedPartnership = new LimitedPartnershipBuilder().build();

    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

    generalPartnerPerson = new GeneralPartnerBuilder().isPerson().withFormerNames("Joe Dee").build();
    generalPartnerLegalEntity = new GeneralPartnerBuilder().isLegalEntity().build();

    appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartnerPerson, generalPartnerLegalEntity]);

    limitedPartnerPerson = new LimitedPartnerBuilder().isPerson().withFormerNames("Joe Dee").build();
    limitedPartnerLegalEntity = new LimitedPartnerBuilder().isLegalEntity().build();
    appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartnerPerson, limitedPartnerLegalEntity]);
  });

  describe("GET Check Your Answers Page", () => {
    it("should GET Check Your Answers Page English text", async () => {
      setLocalesEnabled(true);
      const res = await request(app).get(URL + "?lang=en");

      expect(res.status).toBe(200);
      testTranslations(res.text, enTranslationText.checkYourAnswersPage, [
        "headingTerm",
        "jurisdictions",
        "headingSic",
        "headingJurisdiction",
        "headingPrincipalPlaceOfBusinessAddress",
        "confirm",
        "futureLawful",
        "capitalContribution",
        "dateEffectiveFrom",
        "payment",
        "update",
        "ceaseDate",
        "warningMessageUpdate",
        "psc"
      ]);
      expect(res.text).toContain(enTranslationText.print.buttonText);
      expect(res.text).toContain(enTranslationText.print.buttonTextNoJs);
      expect(res.text).not.toContain(enTranslationText.checkYourAnswersPage.partners.generalPartners.dateEffectiveFrom);
      expect(res.text).not.toContain(enTranslationText.checkYourAnswersPage.partners.limitedPartners.dateEffectiveFrom);
      expect(res.text).not.toContain("WELSH -");
      expect(res.text).toContain(customerFeedbackUrlMap.transition);
    });

    it("should GET Check Your Answers Page Welsh text", async () => {
      setLocalesEnabled(true);
      const res = await request(app).get(URL + "?lang=cy");

      expect(res.status).toBe(200);
      testTranslations(res.text, cyTranslationText.checkYourAnswersPage, [
        "headingTerm",
        "jurisdictions",
        "headingSic",
        "headingJurisdiction",
        "headingPrincipalPlaceOfBusinessAddress",
        "confirm",
        "futureLawful",
        "capitalContribution",
        "dateEffectiveFrom",
        "payment",
        "update",
        "ceaseDate",
        "warningMessageUpdate",
        "psc"
      ]);
      expect(res.text).toContain(cyTranslationText.print.buttonText);
      expect(res.text).toContain(cyTranslationText.print.buttonTextNoJs);
      expect(res.text).not.toContain(cyTranslationText.checkYourAnswersPage.partners.generalPartners.dateEffectiveFrom);
      expect(res.text).not.toContain(cyTranslationText.checkYourAnswersPage.partners.limitedPartners.dateEffectiveFrom);
      expect(res.text).toContain("WELSH -");
      expect(res.text).toContain(customerFeedbackUrlMap.transition);
    });

    it.each([
      [URL + "?lang=en", "/limited-partnerships/sign-out?lang=en"],
      [URL + "?lang=cy", "/limited-partnerships/sign-out?lang=cy"],
      [URL, "/limited-partnerships/sign-out"]
    ])("should set the signout link href correctly for url: %s", async (testUrl: string, expectedHref: string) => {
      setLocalesEnabled(true);
      const res = await request(app).get(testUrl);

      expect(res.status).toBe(200);
      expect(res.text).toContain(expectedHref);
    });

    it("should load the check your answers page with data from api and show change links", async () => {
      const res = await request(app).get(URL);

      expect(res.status).toBe(200);
      expect(res.text).toContain(limitedPartnership?.data?.partnership_name?.toUpperCase());
      expect(res.text).toContain(limitedPartnership?.data?.partnership_number?.toUpperCase());
      expect(res.text).toContain(limitedPartnership?.data?.name_ending?.toUpperCase());
      expect(res.text).toContain(limitedPartnership?.data?.email);
      expect(res.text).toContain("4 Line 1, Line 2, Stoke-On-Trent, Region, England, ST6 3LJ");
      expect(res.text).toContain("enter-registered-office-address#premises");
      expect(res.text).toContain("registered-email-address#email");
    });

    it.each([
      [PartnershipType.LP, enTranslationText.partnership.types.LP],
      [PartnershipType.SLP, enTranslationText.partnership.types.SLP],
      [PartnershipType.PFLP, enTranslationText.partnership.types.PFLP],
      [PartnershipType.SPFLP, enTranslationText.partnership.types.SPFLP]
    ])("should show the partnership type", async (partnershipType: PartnershipType, text: string) => {
      const limitedPartnership = new LimitedPartnershipBuilder().withPartnershipType(partnershipType).build();
      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);
      const res = await request(app).get(URL);

      expect(res.status).toBe(200);
      expect(res.text).toContain(text);
    });
  });

  describe("partners", () => {
    it.each([
      ["en", enTranslationText],
      ["cy", cyTranslationText]
    ])("should load the check your answers page with partners - %s", async (lang, translationText) => {
      setLocalesEnabled(true);
      const res = await request(app).get(URL + `?lang=${lang}`);

      expect(res.status).toBe(200);

      expect(res.text).not.toContain(translationText.checkYourAnswersPage.partners.limitedPartners.capitalContribution);

      testTranslations(res.text, translationText.checkYourAnswersPage.partners, [
        "capitalContribution",
        "dateEffectiveFrom",
        "ceaseDate",
        "warningMessageUpdate"
      ]);

      checkIfPartnerValuesInText(res.text, generalPartnerPerson.data!, checkYourAnswersPersonKeys, translationText);

      checkIfPartnerValuesInText(res.text, generalPartnerLegalEntity.data!, checkYourAnswersLegalEntityKeys, translationText);

      checkIfPartnerValuesInText(res.text, limitedPartnerPerson.data!, checkYourAnswersPersonKeys, translationText);

      checkIfPartnerValuesInText(res.text, limitedPartnerLegalEntity.data!, checkYourAnswersLegalEntityKeys, translationText);

      expect(res.text).toContain(translationText.nationalities.british);
      expect(res.text).toContain(translationText.countries.unitedStates);
    });

    it.each([
      ["en", PartnershipType.LP, enTranslationText],
      ["cy", PartnershipType.LP, cyTranslationText],
      ["en", PartnershipType.SLP, enTranslationText],
      ["cy", PartnershipType.SLP, cyTranslationText]
    ])(
      "should show limited partner capital contributions - %s - %s",
      async (lang, partnershipType, translationText) => {
        setLocalesEnabled(true);

        limitedPartnership = new LimitedPartnershipBuilder().withPartnershipType(partnershipType).build();
        appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

        limitedPartnerPerson = new LimitedPartnerBuilder()
          .isPerson()
          .withContributionCurrencyType("GBP")
          .withContributionCurrencyValue("5000.00")
          .withContributionSubtypes(["MONEY", "SHARES"])
          .build();
        limitedPartnerLegalEntity = new LimitedPartnerBuilder()
          .isLegalEntity()
          .withContributionCurrencyType("EUR")
          .withContributionCurrencyValue("10000.00")
          .withContributionSubtypes(["LAND_OR_PROPERTY", "SERVICES_OR_GOODS", "ANY_OTHER_ASSET"])
          .build();
        appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartnerPerson, limitedPartnerLegalEntity]);

        const res = await request(app).get(URL + `?lang=${lang}`);

        expect(res.status).toBe(200);

        expect(res.text).toContain(translationText.checkYourAnswersPage.partners.limitedPartners.capitalContribution);

        expect(res.text).toContain(`5000.00 ${translationText.currencies.GBP}`);
        expect(res.text).toContain(translationText.partner.capitalContribution.money);
        expect(res.text).toContain(translationText.partner.capitalContribution.shares);

        expect(res.text).toContain(`10000.00 ${translationText.currencies.EUR}`);
        expect(res.text).toContain(translationText.partner.capitalContribution.landOrProperty);
        expect(res.text).toContain(translationText.partner.capitalContribution.servicesOrGoods);
        expect(res.text).toContain(translationText.partner.capitalContribution.anyOtherAsset);
      }
    );

    it.each([
      ["en", PartnershipType.LP, enTranslationText],
      ["cy", PartnershipType.LP, cyTranslationText],
      ["en", PartnershipType.SLP, enTranslationText],
      ["cy", PartnershipType.SLP, cyTranslationText]
    ])(
      "should not show limited partner capital contributions when there are none - %s - %s",
      async (lang, partnershipType, translationText) => {
        setLocalesEnabled(true);

        limitedPartnership = new LimitedPartnershipBuilder().withPartnershipType(partnershipType).build();
        appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

        const res = await request(app).get(URL + `?lang=${lang}`);

        expect(res.status).toBe(200);

        expect(res.text).toContain(limitedPartnerPerson.data?.forename);
        expect(res.text).toContain(limitedPartnerLegalEntity.data?.legal_entity_name);

        expect(res.text).not.toContain(translationText.checkYourAnswersPage.partners.limitedPartners.capitalContribution);
        Object.values(translationText.currencies).forEach((currency) => expect(res.text).not.toContain(currency));
        expect(res.text).not.toContain(translationText.partner.capitalContribution.money);
        expect(res.text).not.toContain(translationText.partner.capitalContribution.landOrProperty);
        expect(res.text).not.toContain(translationText.partner.capitalContribution.shares);
        expect(res.text).not.toContain(translationText.partner.capitalContribution.servicesOrGoods);
        expect(res.text).not.toContain(translationText.partner.capitalContribution.anyOtherAsset);
      }
    );
  });

  describe("POST Check Your Answers Page", () => {
    it("should navigate to next page", async () => {
      const res = await request(app).post(URL).send({
        pageType: TransitionPageType.checkYourAnswers
      });

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);
    });
  });
});
