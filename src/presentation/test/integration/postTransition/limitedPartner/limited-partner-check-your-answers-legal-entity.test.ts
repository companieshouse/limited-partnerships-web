import request from "supertest";
import app from "../../app";

import enTranslationText from "../../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../../locales/cy/translations.json";

import { appDevDependencies } from "../../../../../config/dev-dependencies";
import LimitedPartnerBuilder from "../../../builder/LimitedPartnerBuilder";
import CompanyProfileBuilder from "../../../builder/CompanyProfileBuilder";
import { LIMITED_PARTNER_CHECK_YOUR_ANSWERS_URL } from "../../../../controller/postTransition/url";
import { getUrl, setLocalesEnabled } from "../../../utils";
import { formatDate } from "../../../../../utils/date-format";
import { LimitedPartner } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";
import { CONFIRM_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL, CONFIRM_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL } from "../../../../controller/addressLookUp/url/postTransition";
import PostTransitionPageType from "../../../../controller/postTransition/pageType";
import { CONFIRMATION_POST_TRANSITION_URL } from "../../../../controller/global/url";

describe("Limited Partner Check Your Answers Page", () => {
  const URL = getUrl(LIMITED_PARTNER_CHECK_YOUR_ANSWERS_URL);
  const REDIRECT_URL = getUrl(CONFIRMATION_POST_TRANSITION_URL);

  let limitedPartnerLegalEntity;

  beforeEach(() => {
    const companyProfile = new CompanyProfileBuilder().build();
    appDevDependencies.companyGateway.feedCompanyProfile(companyProfile.data);

    limitedPartnerLegalEntity = new LimitedPartnerBuilder().isLegalEntity().withDateEffectiveFrom("2024-10-10").build();
    appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartnerLegalEntity]);
  });

  it("should GET Check Your Answers Page English text", async () => {
    setLocalesEnabled(true);
    const res = await request(app).get(URL + "?lang=en");

    expect(res.status).toBe(200);

    expect(res.text).toContain(enTranslationText.checkYourAnswersPage.update.title);
    expect(res.text).toContain(enTranslationText.print.buttonText);
    expect(res.text).toContain(enTranslationText.print.buttonTextNoJs);
    expect(res.text).not.toContain("WELSH -");
  });

  it("should GET Check Your Answers Page Welsh text", async () => {
    setLocalesEnabled(true);
    const res = await request(app).get(URL + "?lang=cy");

    expect(res.status).toBe(200);

    expect(res.text).toContain(cyTranslationText.checkYourAnswersPage.update.title);
    expect(res.text).toContain(cyTranslationText.print.buttonText);
    expect(res.text).toContain(cyTranslationText.print.buttonTextNoJs);
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

  it("Should contain a back link to the confirm principal office address page", async () => {
    const limitedPartnerLegalEntity = new LimitedPartnerBuilder()
      .isLegalEntity()
      .build();

    appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartnerLegalEntity]);

    const res = await request(app).get(URL);

    expect(res.status).toBe(200);
    expect(res.text).toContain(getUrl(CONFIRM_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL));
    expect(res.text).not.toContain(getUrl(CONFIRM_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL));
  });

  it("should load the check your answers page with partners - EN", async () => {
    const res = await request(app).get(URL);

    expect(res.status).toBe(200);
    checkIfValuesInText(res, limitedPartnerLegalEntity, enTranslationText);
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

const checkIfValuesInText = (res: request.Response, partner: LimitedPartner, translationText: Record<string, any>) => {
  for (const key in partner.data) {
    if (typeof partner.data[key] === "string" || typeof partner.data[key] === "object") {
      if (key === "principal_office_address") {
        const capitalized = partner.data[key].address_line_1
          .split(" ")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(" ");
        expect(res.text).toContain(capitalized);
      } else if (key.includes("date_effective_from")) {
        expect(res.text).toContain(formatDate(partner.data[key], translationText));
      } else if (!key.includes("address")) {
        expect(res.text).toContain(partner.data[key]);
      }
    }
  }
};
