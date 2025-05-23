import request from "supertest";
import app from "../app";

import { Jurisdiction, LimitedPartnership, PartnershipType } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";
import { CHECK_YOUR_ANSWERS_URL } from "../../../controller/registration/url";
import enTranslationText from "../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../locales/cy/translations.json";
import { appDevDependencies } from "../../../../config/dev-dependencies";
import LimitedPartnershipBuilder from "../../builder/LimitedPartnershipBuilder";
import { getUrl, setLocalesEnabled, testTranslations } from "../../utils";
import RegistrationPageType from "../../../controller/registration/PageType";

describe("Check Your Answers Page", () => {
  const URL = getUrl(CHECK_YOUR_ANSWERS_URL);
  const PAYMENT_LINK_JOURNEY = "https://api-test-payments.chs.local:4001";

  describe("GET Check Your Answers Page", () => {
    it("should GET Check Your Answers Page English text", async () => {
      setLocalesEnabled(true);
      const res = await request(app).get(URL + "?lang=en");

      expect(res.status).toBe(200);
      testTranslations(res.text, enTranslationText.checkYourAnswersPage, [
        "headingTerm",
        "jurisdictions",
        "headingSic"
      ]);
      expect(res.text).not.toContain("WELSH -");
    });

    it("should GET Check Your Answers Page Welsh text", async () => {
      setLocalesEnabled(true);
      const res = await request(app).get(URL + "?lang=cy");

      expect(res.status).toBe(200);
      testTranslations(res.text, cyTranslationText.checkYourAnswersPage, [
        "headingTerm",
        "jurisdictions",
        "headingSic"
      ]);
      expect(res.text).toContain("WELSH -");
    });

    it("should load the check your answers page with data from api and show change links", async () => {
      const limitedPartnership = new LimitedPartnershipBuilder().build();
      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);
      const res = await request(app).get(URL);

      expect(res.status).toBe(200);
      expect(res.text).toContain(limitedPartnership?.data?.partnership_name?.toUpperCase());
      expect(res.text).toContain(limitedPartnership?.data?.name_ending?.toUpperCase());
      expect(res.text).toContain(limitedPartnership?.data?.email);
      expect(res.text).toContain("4 Line 1, Line 2, Stoke-On-Trent, England, ST6 3LJ");
      expect(res.text).toContain("2 Line 3, Line 4, Burton-On-Trent, England, DE6 3LJ");
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
        appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);
        const res = await request(app).get(URL);

        expect(res.status).toBe(200);

        if (changeLinkExpected) {
          expect(res.text).toContain("where-is-the-jurisdiction#jurisdiction");
        } else {
          expect(res.text).not.toContain("where-is-the-jurisdiction#jurisdiction");
        }
      }
    );

    it.each([
      [Jurisdiction.ENGLAND_AND_WALES, enTranslationText.checkYourAnswersPage.jurisdictions.englandAndWales],
      [Jurisdiction.NORTHERN_IRELAND, enTranslationText.checkYourAnswersPage.jurisdictions.northernIreland],
      [Jurisdiction.SCOTLAND, enTranslationText.checkYourAnswersPage.jurisdictions.scotland]
    ])(
      "should show correct jurisdiction text based on jurisdiction",
      async (jurisdiction: Jurisdiction, jurisdictionTextExpected: string) => {
        const limitedPartnership = new LimitedPartnershipBuilder().withJurisdiction(jurisdiction).build();
        appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);
        const res = await request(app).get(URL);

        expect(res.status).toBe(200);

        expect(res.text).toContain(jurisdictionTextExpected);
      }
    );

    it.each([
      [PartnershipType.LP, true],
      [PartnershipType.SLP, true],
      [PartnershipType.PFLP, false],
      [PartnershipType.SPFLP, false]
    ])(
      "should show term, SIC codes and change links based on the partnership type",
      async (partnershipType: PartnershipType, headingsAndChangeLinksExpected: boolean) => {
        const limitedPartnership = new LimitedPartnershipBuilder().withPartnershipType(partnershipType).build();
        appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);
        const res = await request(app).get(URL);

        expect(res.status).toBe(200);

        if (headingsAndChangeLinksExpected) {
          expect(res.text).toContain("term#term");
          expect(res.text).toContain(enTranslationText.checkYourAnswersPage.headingTerm);
          expect(res.text).toContain("standard-industrial-classification-code#sic1");
          expect(res.text).toContain(enTranslationText.checkYourAnswersPage.headingSic);
        } else {
          expect(res.text).not.toContain("term#term");
          expect(res.text).not.toContain(enTranslationText.checkYourAnswersPage.headingTerm);
          expect(res.text).not.toContain("standard-industrial-classification-code#sic1");
          expect(res.text).not.toContain(enTranslationText.checkYourAnswersPage.headingSic);
        }
      }
    );

    it.each([
      ["BY_AGREEMENT", enTranslationText.termPage.byAgreement],
      ["UNTIL_DISSOLUTION", enTranslationText.termPage.untilDissolution],
      ["NONE", enTranslationText.termPage.noTerm],
      ["TERM_NOT_MATCHED", ""]
    ])(
      "should show the correct text for term based on term selected",
      async (termKey: any, expectedTermText: string) => {
        const limitedPartnership = new LimitedPartnershipBuilder().withTerm(termKey).build();

        appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

        const res = await request(app).get(URL);

        expect(res.status).toBe(200);
        expect(res.text).toContain(expectedTermText);
      }
    );
  });

  it.each([
    [PartnershipType.LP, enTranslationText.types.LP],
    [PartnershipType.SLP, enTranslationText.types.SLP],
    [PartnershipType.PFLP, enTranslationText.types.PFLP],
    [PartnershipType.SPFLP, enTranslationText.types.SPFLP]
  ])("should show the partnership type", async (partnershipType: PartnershipType, text: string) => {
    const limitedPartnership = new LimitedPartnershipBuilder().withPartnershipType(partnershipType).build();
    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);
    const res = await request(app).get(URL);

    expect(res.status).toBe(200);

    expect(res.text).toContain("which-type");
    expect(res.text).toContain(text);
  });

  describe("POST Check Your Answers Page", () => {

    it("should send lawful purpose statement", async () => {
      const limitedPartnership = new LimitedPartnershipBuilder()
        .withId(appDevDependencies.limitedPartnershipGateway.submissionId)
        .build();

      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

      const res = await request(app).post(URL).send({
        pageType: RegistrationPageType.checkYourAnswers,
        lawful_purpose_statement_checked: "true"
      });

      const lp: LimitedPartnership = await appDevDependencies.limitedPartnershipGateway.getLimitedPartnership({ access_token: "", refresh_token: "" }, "", "");
      expect(lp.data?.lawful_purpose_statement_checked).toBe("true");
      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${PAYMENT_LINK_JOURNEY}`);
    });

    it("should navigate to next page", async () => {
      const res = await request(app).post(URL).send({
        pageType: RegistrationPageType.checkYourAnswers
      });

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${PAYMENT_LINK_JOURNEY}`);
    });

    it("should throw error when payment redirect url is missing", async () => {
      // call transaction gateway and ovverride so there is no payment header
      appDevDependencies.paymentGateway.feedPaymentWithEmptyJourney();
      const res = await request(app).post(URL).send({
        pageType: RegistrationPageType.checkYourAnswers
      });

      expect(res.status).toBe(500);
      expect(res.text).not.toContain(`Redirecting to ${PAYMENT_LINK_JOURNEY}`);
    });
  });
});
