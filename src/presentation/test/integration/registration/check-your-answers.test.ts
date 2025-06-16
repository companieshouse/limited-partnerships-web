import request from "supertest";
import app from "../app";

import { GeneralPartner, LimitedPartner, Jurisdiction, PartnershipType } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";
import { CHECK_YOUR_ANSWERS_URL } from "../../../controller/registration/url";
import enTranslationText from "../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../locales/cy/translations.json";
import { appDevDependencies } from "../../../../config/dev-dependencies";
import LimitedPartnershipBuilder from "../../builder/LimitedPartnershipBuilder";
import { getUrl, setLocalesEnabled, testTranslations } from "../../utils";
import RegistrationPageType from "../../../controller/registration/PageType";
import GeneralPartnerBuilder from "../../builder/GeneralPartnerBuilder";
import LimitedPartnerBuilder from "../../builder/LimitedPartnerBuilder";
import { formatDate } from "../../../../utils/date-format";

describe("Check Your Answers Page", () => {
  const URL = getUrl(CHECK_YOUR_ANSWERS_URL);
  const PAYMENT_LINK_JOURNEY = "https://api-test-payments.chs.local:4001";

  let limitedPartnership;
  let generalPartnerPerson;
  let generalPartnerLegalEntity;
  let limitedPartnerPerson;
  let limitedPartnerLegalEntity;

  beforeEach(() => {
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
        "amountContributed"
      ]);
      expect(res.text).toContain(enTranslationText.print.buttonText);
      expect(res.text).toContain(enTranslationText.print.buttonTextNoJs);
      expect(res.text).not.toContain("WELSH -");
    });

    it("should GET Check Your Answers Page Welsh text", async () => {
      setLocalesEnabled(true);
      const res = await request(app).get(URL + "?lang=cy");

      expect(res.status).toBe(200);
      testTranslations(res.text, cyTranslationText.checkYourAnswersPage, [
        "headingTerm",
        "jurisdictions",
        "headingSic",
        "amountContributed"
      ]);
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

    it("should load the check your answers page with data from api and show change links", async () => {
      const res = await request(app).get(URL);

      expect(res.status).toBe(200);
      expect(res.text).toContain(limitedPartnership?.data?.partnership_name?.toUpperCase());
      expect(res.text).toContain(limitedPartnership?.data?.name_ending?.toUpperCase());
      expect(res.text).toContain(limitedPartnership?.data?.email);
      expect(res.text).toContain("4 Line 1, Line 2, Stoke-On-Trent, Region, England, ST6 3LJ");
      expect(res.text).toContain("enter-registered-office-address#premises");
      expect(res.text).toContain("2 Line 3, Line 4, Burton-On-Trent, Regionpp, England, DE6 3LJ");
      expect(res.text).toContain("enter-principal-place-of-business-address#premises");
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

  it("should load the check your answers page with partners - EN", async () => {
    const res = await request(app).get(URL);

    expect(res.status).toBe(200);

    testTranslations(res.text, enTranslationText.checkYourAnswersPage, ["scotland", "amountContributed"]);

    checkIfValuesInText(res, generalPartnerPerson, enTranslationText);

    checkIfValuesInText(res, generalPartnerLegalEntity, enTranslationText);

    checkIfValuesInText(res, limitedPartnerPerson, enTranslationText);

    checkIfValuesInText(res, limitedPartnerLegalEntity, enTranslationText);
  });

  it("should load the check your answers page with partners - CY", async () => {
    const res = await request(app).get(URL + "?lang=cy");

    expect(res.status).toBe(200);

    testTranslations(res.text, cyTranslationText.checkYourAnswersPage, [
      "scotland",
      "northernIreland",
      "amountContributed"
    ]);

    checkIfValuesInText(res, generalPartnerPerson, cyTranslationText);

    checkIfValuesInText(res, generalPartnerLegalEntity, cyTranslationText);

    checkIfValuesInText(res, limitedPartnerPerson, cyTranslationText);

    checkIfValuesInText(res, limitedPartnerLegalEntity, cyTranslationText);
  });

  describe("POST Check Your Answers Page", () => {
    it("should send lawful purpose statement", async () => {
      const limitedPartnership = new LimitedPartnershipBuilder()
        .withId(appDevDependencies.limitedPartnershipGateway.submissionId)
        .build();

      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

      await request(app).post(URL).send({
        pageType: RegistrationPageType.checkYourAnswers,
        lawful_purpose_statement_checked: "true"
      });

      expect(
        appDevDependencies.limitedPartnershipGateway.limitedPartnerships[0]?.data?.lawful_purpose_statement_checked
      ).toBe("true");
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

const checkIfValuesInText = (res: request.Response, partner: GeneralPartner | LimitedPartner, translationText: Record<string, any>) => {
  for (const key in partner.data) {
    if (typeof partner.data[key] === "string" || typeof partner.data[key] === "object") {
      if (key === "nationality1") {
        const capitalized = partner.data[key].charAt(0).toUpperCase() + partner.data[key].slice(1).toLowerCase();

        expect(res.text).toContain(capitalized);
      } else if (key.includes("date_of_birth") && partner.data[key]) {
        expect(res.text).toContain(formatDate(partner.data[key], translationText));
      } else if (key.includes("address")) {
        const capitalized = partner.data[key].address_line_1
          .split(" ")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(" ");

        expect(res.text).toContain(capitalized);
      } else {
        expect(res.text).toContain(partner.data[key]);
      }
    }
  }
};
