import request from "supertest";
import app from "../../../app";

import { appDevDependencies } from "../../../../../../config/dev-dependencies";
import CompanyProfileBuilder from "../../../../builder/CompanyProfileBuilder";
import { LIMITED_PARTNER_CHECK_YOUR_ANSWERS_URL } from "../../../../../controller/postTransition/url";
import { capitalize, countOccurrences, getUrl, setLocalesEnabled, testTranslations } from "../../../../utils";
import { formatDate } from "../../../../../../utils/date-format";
import { LimitedPartner, PartnerKind } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";
import { CONFIRM_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL, CONFIRM_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL } from "../../../../../controller/addressLookUp/url/postTransition";
import LimitedPartnerBuilder from "../../../../../../presentation/test/builder/LimitedPartnerBuilder";
import PostTransitionPageType from "../../../../../controller/postTransition/pageType";
import { CONFIRMATION_POST_TRANSITION_URL } from "../../../../../controller/global/url";
import TransactionBuilder from "../../../../builder/TransactionBuilder";
import { enTranslationText, cyTranslationText } from "../../../../../../test/utils/locales";

describe("Limited Partner Check Your Answers Page for Person", () => {
  const URL = getUrl(LIMITED_PARTNER_CHECK_YOUR_ANSWERS_URL);
  const REDIRECT_URL = getUrl(CONFIRMATION_POST_TRANSITION_URL);

  let limitedPartnerPerson;

  beforeEach(() => {
    const companyProfile = new CompanyProfileBuilder().build();
    appDevDependencies.companyGateway.feedCompanyProfile(companyProfile.data);

    limitedPartnerPerson = new LimitedPartnerBuilder()
      .withId(appDevDependencies.limitedPartnerGateway.limitedPartnerId)
      .isPerson()
      .withFormerNames("Joe Dee")
      .withDateEffectiveFrom("2024-10-10")
      .withNationality1("Welsh")
      .build();

    appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartnerPerson]);

    const transaction = new TransactionBuilder().withKind(PartnerKind.ADD_LIMITED_PARTNER_PERSON).build();
    appDevDependencies.transactionGateway.feedTransactions([transaction]);
  });

  it.each([
    ["en", enTranslationText],
    ["cy", cyTranslationText]
  ])("should GET Check Your Answers Page %s text", async (lang, translationText) => {
    setLocalesEnabled(true);
    const res = await request(app).get(URL + `?lang=${lang}`);

    expect(res.status).toBe(200);

    expect(res.text).toContain(translationText.checkYourAnswersPage.update.title);
    expect(res.text).toContain(translationText.print.buttonText);
    expect(res.text).toContain(translationText.print.buttonTextNoJs);
    expect(res.text).toContain(translationText.nationalities.welsh);
    testTranslations(res.text, translationText.checkYourAnswersPage.warningMessage);
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
  ])(
    "should set the signout link href correctly for url: %s",
    async (testUrl: string, expectedHref: string) => {
      setLocalesEnabled(true);
      const res = await request(app).get(testUrl);

      expect(res.status).toBe(200);
      expect(res.text).toContain(expectedHref);
    }
  );

  it("Should contain a back link to the confirm usual residential address page", async () => {
    const res = await request(app).get(URL);

    expect(res.status).toBe(200);
    expect(res.text).not.toContain(getUrl(CONFIRM_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL));
    expect(res.text).toContain(getUrl(CONFIRM_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL));
  });

  it("should load the check your answers page with partners with no dates - EN", async () => {
    limitedPartnerPerson = new LimitedPartnerBuilder()
      .withId(appDevDependencies.limitedPartnerGateway.limitedPartnerId)
      .isPerson()
      .withFormerNames("Joe Dee")
      .withDateOfBirth(undefined)
      .withDateEffectiveFrom(undefined)
      .build();

    appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartnerPerson]);

    const res = await request(app).get(URL);

    expect(res.status).toBe(200);
    checkIfValuesInText(res, limitedPartnerPerson, enTranslationText);
  });

  it("should load the check your answers page with partners with dates- EN", async () => {
    limitedPartnerPerson = new LimitedPartnerBuilder()
      .withId(appDevDependencies.limitedPartnerGateway.limitedPartnerId)
      .isPerson()
      .withFormerNames("Joe Dee")
      .withDateOfBirth("1984-11-03")
      .withDateEffectiveFrom("2024-10-10")
      .build();

    appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartnerPerson]);

    const res = await request(app).get(URL);

    expect(res.status).toBe(200);
    checkIfValuesInText(res, limitedPartnerPerson, enTranslationText);
  });

  it.each([
    { lang: "EN", testUrl: URL, translationText: enTranslationText },
    { lang: "CY", testUrl: URL + "?lang=cy", translationText: cyTranslationText }
  ])(
    "should display capital contribution on check your answers page - $lang",
    async ({ testUrl, translationText }) => {
      setLocalesEnabled(true);

      limitedPartnerPerson = new LimitedPartnerBuilder()
        .withId(appDevDependencies.limitedPartnerGateway.limitedPartnerId)
        .isPerson()
        .withFormerNames("Joe Dee")
        .withDateOfBirth("1984-11-03")
        .withDateEffectiveFrom("2024-10-10")
        .withContributionCurrencyType("GBP")
        .withContributionCurrencyValue("5000.00")
        .withContributionSubtypes(["MONEY", "SHARES"])
        .build();

      appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartnerPerson]);

      const res = await request(app).get(testUrl);

      expect(res.status).toBe(200);
      expect(res.text).toContain(translationText.checkYourAnswersPage.partners.limitedPartners.capitalContribution);
      expect(res.text).toContain("5000.00");
      expect(res.text).toContain(translationText.currencies.GBP);
      expect(res.text).toContain(translationText.capitalContribution.money);
      expect(res.text).toContain(translationText.capitalContribution.shares);
    }
  );

  describe("POST Check Your Answers Page", () => {
    it("should navigate to next page", async () => {
      limitedPartnerPerson = new LimitedPartnerBuilder()
        .isPerson()
        .withId(appDevDependencies.limitedPartnerGateway.limitedPartnerId)
        .withDateEffectiveFrom("2024-10-10")
        .build();

      appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartnerPerson]);

      const res = await request(app).post(URL).send({
        pageType: PostTransitionPageType.limitedPartnerCheckYourAnswers
      });

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);
    });
  });
});

const checkIfValuesInText = (res: request.Response, partner: LimitedPartner, translationText: Record<string, any>) => {
  const partnerData = partner.data as Record<string, any>;

  for (const key in partnerData) {
    const value = partnerData[key];

    if (typeof value !== "string" && typeof value !== "object") {
      continue;
    }

    if (key === "nationality1") {
      expect(res.text).toContain(capitalize(value));
    } else if (key.includes("date_of_birth") && value) {
      expect(res.text).toContain(formatDate(value, translationText));
    } else if (key.includes("usual_residential_address")) {
      expect(res.text).toContain(value.address_line_1.split(" ").map(capitalize).join(" "));
    } else if (key.includes("date_effective_from")) {
      expect(res.text).toContain(formatDate(value, translationText));
    }
  }
};

