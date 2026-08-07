import request from "supertest";
import app from "../../../app";
import { appDevDependencies } from "../../../../../../config/dev-dependencies";
import LimitedPartnerBuilder from "../../../../builder/LimitedPartnerBuilder";
import CompanyProfileBuilder from "../../../../builder/CompanyProfileBuilder";
import { LIMITED_PARTNER_CHECK_YOUR_ANSWERS_URL } from "../../../../../controller/postTransition/url";
import { checkIfPartnerValuesInText, countOccurrences, getUrl, checkYourAnswersLegalEntityKeys, setLocalesEnabled } from "../../../../utils";
import { PartnerKind } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";
import {
  CONFIRM_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  CONFIRM_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL
} from "../../../../../controller/addressLookUp/url/postTransition";
import PostTransitionPageType from "../../../../../controller/postTransition/pageType";
import { CONFIRMATION_POST_TRANSITION_URL } from "../../../../../controller/global/url";
import TransactionBuilder from "../../../../builder/TransactionBuilder";
import TransactionLimitedPartner from "../../../../../../domain/entities/TransactionLimitedPartner";
import { enTranslationText, cyTranslationText } from "../../../../../../test/utils/locales";

describe("Limited Partner Check Your Answers Page", () => {
  const URL = getUrl(LIMITED_PARTNER_CHECK_YOUR_ANSWERS_URL);
  const REDIRECT_URL = getUrl(CONFIRMATION_POST_TRANSITION_URL);

  let limitedPartnerLegalEntity: TransactionLimitedPartner;

  beforeEach(() => {
    const companyProfile = new CompanyProfileBuilder().build();
    appDevDependencies.companyGateway.feedCompanyProfile(companyProfile.data);

    limitedPartnerLegalEntity = new LimitedPartnerBuilder()
      .withId(appDevDependencies.limitedPartnerGateway.limitedPartnerId)
      .isLegalEntity()
      .withDateEffectiveFrom("2024-10-10")
      .withLegalEntityRegistrationLocation("Wales")
      .build();

    appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartnerLegalEntity]);

    const transaction = new TransactionBuilder().withKind(PartnerKind.ADD_LIMITED_PARTNER_LEGAL_ENTITY).build();
    appDevDependencies.transactionGateway.feedTransactions([transaction]);
  });

  it.each([
    ["en", enTranslationText, enTranslationText],
    ["cy", cyTranslationText, cyTranslationText]
  ])("should GET Check Your Answers Page %s text", async (lang, translationText, countriesText) => {
    setLocalesEnabled(true);
    const res = await request(app).get(URL + `?lang=${lang}`);

    expect(res.status).toBe(200);

    expect(res.text).toContain(translationText.checkYourAnswersPage.update.title);
    expect(res.text).toContain(translationText.print.buttonText);
    expect(res.text).toContain(translationText.print.buttonTextNoJs);
    expect(res.text).toContain(countriesText.countries.wales);
    if (lang === "cy") {
      expect(res.text).toContain("WELSH -");
    } else {
      expect(res.text).not.toContain("WELSH -");
    }
    expect(countOccurrences(res.text, translationText.serviceName.addLimitedPartner)).toBe(2);
    expect(res.text).toContain(`data-event-id="check-your-answers-add-limited-partner-submit-button"`);
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

  it("Should contain a back link to the confirm principal office address page", async () => {
    const res = await request(app).get(URL);

    expect(res.status).toBe(200);
    expect(res.text).toContain(getUrl(CONFIRM_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL));
    expect(res.text).not.toContain(getUrl(CONFIRM_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL));
  });

  it("should load the check your answers page with partners - EN", async () => {
    const res = await request(app).get(URL);

    expect(res.status).toBe(200);
    checkIfPartnerValuesInText(res.text, limitedPartnerLegalEntity.data!, checkYourAnswersLegalEntityKeys, enTranslationText);
  });

  it.each([
    { lang: "EN", testUrl: URL, translationText: enTranslationText },
    { lang: "CY", testUrl: URL + "?lang=cy", translationText: cyTranslationText }
  ])("should display capital contribution on check your answers page - $lang", async ({ testUrl, translationText }) => {
    setLocalesEnabled(true);

    limitedPartnerLegalEntity = new LimitedPartnerBuilder()
      .withId(appDevDependencies.limitedPartnerGateway.limitedPartnerId)
      .isLegalEntity()
      .withDateEffectiveFrom("2024-10-10")
      .withLegalEntityRegistrationLocation("Wales")
      .withContributionCurrencyType("GBP")
      .withContributionCurrencyValue("10000.00")
      .withContributionSubtypes(["MONEY", "LAND_OR_PROPERTY"])
      .build();

    appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartnerLegalEntity]);

    const res = await request(app).get(testUrl);

    expect(res.status).toBe(200);
    expect(res.text).toContain(translationText.checkYourAnswersPage.partners.limitedPartners.capitalContribution);
    expect(res.text).toContain("10000.00");
    expect(res.text).toContain(translationText.currencies.GBP);
    expect(res.text).toContain(translationText.partner.capitalContribution.money);
    expect(res.text).toContain(translationText.partner.capitalContribution.landOrProperty);
  });

  describe("POST Check Your Answers Page", () => {
    it("should navigate to next page", async () => {
      limitedPartnerLegalEntity = new LimitedPartnerBuilder()
        .isLegalEntity()
        .withId(appDevDependencies.limitedPartnerGateway.limitedPartnerId)
        .withDateEffectiveFrom("2024-10-10")
        .build();

      appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartnerLegalEntity]);

      const res = await request(app).post(URL).send({
        pageType: PostTransitionPageType.limitedPartnerCheckYourAnswers
      });

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);
    });
  });
});
