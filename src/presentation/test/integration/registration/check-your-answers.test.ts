import request from "supertest";
import app from "../app";

import { PartnershipType } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";
import { CHECK_YOUR_ANSWERS_URL, APPLICATION_SUBMITTED_URL } from "../../../controller/registration/url";
import enTranslationText from "../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../locales/cy/translations.json";
import { appDevDependencies } from "../../../../config/dev-dependencies";
import LimitedPartnershipBuilder from "../../builder/LimitedPartnershipBuilder";
import { getUrl, setLocalesEnabled, testTranslations } from "../../utils";
import RegistrationPageType from "../../../controller/registration/PageType";

describe("Check Your Answers Page", () => {
  const URL = getUrl(CHECK_YOUR_ANSWERS_URL);
  const REDIRECT_URL = getUrl(APPLICATION_SUBMITTED_URL);

  describe("GET Check Your Answers Page", () => {
    it("should GET Check Your Answers Page English text", async () => {
      setLocalesEnabled(true);
      const res = await request(app).get(URL + "?lang=en");

      expect(res.status).toBe(200);
      testTranslations(res.text, enTranslationText.checkYourAnswersPage, [
        "headingTerm",
      ]);
      expect(res.text).not.toContain("WELSH -");
    });

    it("should GET Check Your Answers Page Welsh text", async () => {
      setLocalesEnabled(true);
      const res = await request(app).get(URL + "?lang=cy");

      expect(res.status).toBe(200);
      testTranslations(res.text, cyTranslationText.checkYourAnswersPage, [
        "headingTerm",
      ]);
      expect(res.text).toContain("WELSH -");
    });

    it("should load the check your answers page with data from api and show change links", async () => {
      const limitedPartnership = new LimitedPartnershipBuilder().build();
      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([
        limitedPartnership
      ]);
      const res = await request(app).get(URL);

      expect(res.status).toBe(200);
      expect(res.text).toContain(limitedPartnership?.data?.partnership_name?.toUpperCase());
      expect(res.text).toContain(limitedPartnership?.data?.name_ending?.toUpperCase());
      expect(res.text).toContain(limitedPartnership?.data?.email);
      expect(res.text).toContain(limitedPartnership?.data?.jurisdiction);
      expect(res.text).toContain("Such term as decided by the partners within the partnership agreement");
      expect(res.text).toContain("12345,67890");

      expect(res.text).toContain("name#partnership_name");
      expect(res.text).toContain("email#email");
      expect(res.text).toContain("where-is-the-jurisdiction#jurisdiction");
      expect(res.text).toContain("term#term");
      expect(res.text).toContain("standard-industrial-classification-code#sic1");
    });

    it.each([
      [PartnershipType.LP, true],
      [PartnershipType.SLP, false],
      [PartnershipType.PFLP, true],
      [PartnershipType.SPFLP, false]
    ])(
      "should show a change link for jurisdiction based on the partnership type",
      async (partnershipType: PartnershipType, changeLinkExpected: boolean) => {
        const limitedPartnership = new LimitedPartnershipBuilder().withPartnershipType(partnershipType).build();
        appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([
          limitedPartnership
        ]);
        const res = await request(app).get(URL);

        expect(res.status).toBe(200);

        if (changeLinkExpected) {
          expect(res.text).toContain("where-is-the-jurisdiction#jurisdiction");
        } else {
          expect(res.text).not.toContain("where-is-the-jurisdiction#jurisdiction");
        }
      });
  });

  it.each([
    [PartnershipType.LP, true],
    [PartnershipType.SLP, true],
    [PartnershipType.PFLP, false],
    [PartnershipType.SPFLP, false]
  ])(
    "should show term and change link based on the partnership type",
    async (partnershipType: PartnershipType, changeLinkExpected: boolean) => {
      const limitedPartnership = new LimitedPartnershipBuilder().withPartnershipType(partnershipType).build();
      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([
        limitedPartnership
      ]);
      const res = await request(app).get(URL);

      expect(res.status).toBe(200);

      if (changeLinkExpected) {
        expect(res.text).toContain("term#term");
        expect(res.text).toContain(enTranslationText.checkYourAnswersPage.headingTerm);
      } else {
        expect(res.text).not.toContain("term#term");
        expect(res.text).not.toContain(enTranslationText.checkYourAnswersPage.headingTerm);
      }
    });

  it.each([
    ["BY_AGREEMENT", enTranslationText.termPage.byAgreement],
    ["UNTIL_DISSOLUTION", enTranslationText.termPage.untilDissolution],
    ["NONE", enTranslationText.termPage.noTerm],
    ["TERM_NOT_MATCHED", ""]
  ])(
    "should show the correct text for term based on term selected",
    async (termKey: any, expectedTermText: string) => {
      const limitedPartnership = new LimitedPartnershipBuilder().withTerm(termKey).build();

      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([
        limitedPartnership
      ]);

      const res = await request(app).get(URL);

      expect(res.status).toBe(200);
      expect(res.text).toContain(expectedTermText);
    });

  describe("POST Check Your Answers Page", () => {
    it("should navigate to next page", async () => {
      const res = await request(app).post(URL).send({
        pageType: RegistrationPageType.checkYourAnswers
      });

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);
    });
  });
});
