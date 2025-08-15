import request from "supertest";
import app from "../../app";

import enTranslationText from "../../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../../locales/cy/translations.json";

import { appDevDependencies } from "../../../../../config/dev-dependencies";
import CompanyProfileBuilder from "../../../builder/CompanyProfileBuilder";
import { LIMITED_PARTNER_CHECK_YOUR_ANSWERS_URL } from "../../../../controller/postTransition/url";
import { getUrl, setLocalesEnabled, testTranslations } from "../../../utils";
import { formatDate } from "../../../../../utils/date-format";
import { LimitedPartner } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";
import { CONFIRM_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL, CONFIRM_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL } from "../../../../controller/addressLookUp/url/postTransition";
import LimitedPartnerBuilder from "../../../../../presentation/test/builder/LimitedPartnerBuilder";

describe("Limited Partner Check Your Answers Page for Person", () => {
  const URL = getUrl(LIMITED_PARTNER_CHECK_YOUR_ANSWERS_URL);

  let limitedPartnerPerson;

  beforeEach(() => {
    const companyProfile = new CompanyProfileBuilder().build();
    appDevDependencies.companyGateway.feedCompanyProfile(companyProfile.data);

    limitedPartnerPerson = new LimitedPartnerBuilder().isPerson().withFormerNames("Joe Dee").withDateEffectiveFrom("2024-10-10").build();
    appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartnerPerson]);
  });

  it("should GET Check Your Answers Page English text with no Date of birth", async () => {
    setLocalesEnabled(true);
    const res = await request(app).get(URL + "?lang=en");

    expect(res.status).toBe(200);

    expect(res.text).toContain(enTranslationText.checkYourAnswersPage.update.title);
    expect(res.text).toContain(enTranslationText.print.buttonText);
    expect(res.text).toContain(enTranslationText.print.buttonTextNoJs);
    testTranslations(res.text, enTranslationText.checkYourAnswersPage.warningMessage);
    expect(res.text).not.toContain("WELSH -");
  });

  it("should GET Check Your Answers Page Welsh text", async () => {
    setLocalesEnabled(true);
    const res = await request(app).get(URL + "?lang=cy");

    expect(res.status).toBe(200);

    expect(res.text).toContain(cyTranslationText.checkYourAnswersPage.update.title);
    expect(res.text).toContain(cyTranslationText.print.buttonText);
    expect(res.text).toContain(cyTranslationText.print.buttonTextNoJs);
    testTranslations(res.text, cyTranslationText.checkYourAnswersPage.warningMessage);
    expect(res.text).toContain("WELSH -");
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
      .isPerson()
      .withFormerNames("Joe Dee")
      .withDateOfBirth(undefined as unknown as string)
      .withDateEffectiveFrom(undefined as unknown as string)
      .build();

    appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartnerPerson]);

    const res = await request(app).get(URL);

    expect(res.status).toBe(200);
    checkIfValuesInText(res, limitedPartnerPerson, enTranslationText);
  });

  it("should load the check your answers page with partners with dates- EN", async () => {
    limitedPartnerPerson = new LimitedPartnerBuilder()
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
});

const checkIfValuesInText = (res: request.Response, partner: LimitedPartner, translationText: Record<string, any>) => {
  for (const key in partner.data) {
    if (typeof partner.data[key] === "string" || typeof partner.data[key] === "object") {
      if (key === "nationality1") {
        const capitalized = partner.data[key].charAt(0).toUpperCase() + partner.data[key].slice(1).toLowerCase();

        expect(res.text).toContain(capitalized);
      } else if (key.includes("date_of_birth") && partner.data[key]) {
        expect(res.text).toContain(formatDate(partner.data[key], translationText));
      } else if (key.includes("usual_residential_address")) {
        const capitalized = partner.data[key].address_line_1
          .split(" ")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(" ");
        expect(res.text).toContain(capitalized);
      } else if (key.includes("date_effective_from")) {
        expect(res.text).toContain(formatDate(partner.data[key], translationText));
      }
    }
  }
};

