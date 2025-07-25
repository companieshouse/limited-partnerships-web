import request from "supertest";
import app from "../app";

import { GeneralPartner, LimitedPartner, PartnershipType } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";
import { CHECK_YOUR_ANSWERS_URL } from "../../../controller/transition/url";
import enTranslationText from "../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../locales/cy/translations.json";
import { appDevDependencies } from "../../../../config/dev-dependencies";
import LimitedPartnershipBuilder from "../../builder/LimitedPartnershipBuilder";
import { getUrl, setLocalesEnabled, testTranslations } from "../../utils";
import GeneralPartnerBuilder from "../../builder/GeneralPartnerBuilder";
import LimitedPartnerBuilder from "../../builder/LimitedPartnerBuilder";
import { formatDate } from "../../../../utils/date-format";
import { TransactionKind } from "../../../../domain/entities/TransactionTypes";
import TransactionBuilder from "../../builder/TransactionBuilder";

describe("Check Your Answers Page", () => {
  const URL = getUrl(CHECK_YOUR_ANSWERS_URL);

  let limitedPartnership;
  let generalPartnerPerson;
  let generalPartnerLegalEntity;
  let limitedPartnerPerson;
  let limitedPartnerLegalEntity;

  beforeEach(() => {
    const transaction = new TransactionBuilder().withFilingMode(TransactionKind.transition).build();
    appDevDependencies.transactionGateway.feedTransactions([transaction]);

    limitedPartnership = new LimitedPartnershipBuilder().build();

    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

    generalPartnerPerson = new GeneralPartnerBuilder().isPerson().withFormerNames("Joe Dee").withDateEffectiveFrom("2024-10-10").build();
    generalPartnerLegalEntity = new GeneralPartnerBuilder().isLegalEntity().withDateEffectiveFrom("2024-10-10").build();

    appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartnerPerson, generalPartnerLegalEntity]);

    limitedPartnerPerson = new LimitedPartnerBuilder().isPerson().withFormerNames("Joe Dee").withDateEffectiveFrom("2024-10-10").build();
    limitedPartnerLegalEntity = new LimitedPartnerBuilder().isLegalEntity().withDateEffectiveFrom("2024-10-10").build();
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
        "payment"
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
        "headingJurisdiction",
        "headingPrincipalPlaceOfBusinessAddress",
        "confirm",
        "futureLawful",
        "capitalContribution",
        "payment"
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
      expect(res.text).toContain(limitedPartnership?.data?.partnership_number?.toUpperCase());
      expect(res.text).toContain(limitedPartnership?.data?.name_ending?.toUpperCase());
      expect(res.text).toContain(limitedPartnership?.data?.email);
      expect(res.text).toContain("4 Line 1, Line 2, Stoke-On-Trent, Region, England, ST6 3LJ");
      expect(res.text).toContain("enter-registered-office-address#premises");
      expect(res.text).toContain("email#email");
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
      expect(res.text).toContain(text);
    });
  });

  describe("partners", () => {
    it("should load the check your answers page with partners - EN", async () => {
      const res = await request(app).get(URL);

      expect(res.status).toBe(200);

      expect(res.text).not.toContain(enTranslationText.checkYourAnswersPage.partners.limitedPartners.capitalContribution);

      testTranslations(res.text, enTranslationText.checkYourAnswersPage.partners, ["capitalContribution"]);

      checkIfValuesInText(res, generalPartnerPerson, enTranslationText);

      checkIfValuesInText(res, generalPartnerLegalEntity, enTranslationText);

      checkIfValuesInText(res, limitedPartnerPerson, enTranslationText);

      checkIfValuesInText(res, limitedPartnerLegalEntity, enTranslationText);
    });

    it("should load the check your answers page with partners - CY", async () => {
      const res = await request(app).get(URL + "?lang=cy");

      expect(res.status).toBe(200);

      expect(res.text).not.toContain(cyTranslationText.checkYourAnswersPage.partners.limitedPartners.capitalContribution);

      testTranslations(res.text, cyTranslationText.checkYourAnswersPage.partners, ["capitalContribution"]);

      checkIfValuesInText(res, generalPartnerPerson, cyTranslationText);

      checkIfValuesInText(res, generalPartnerLegalEntity, cyTranslationText);

      checkIfValuesInText(res, limitedPartnerPerson, cyTranslationText);

      checkIfValuesInText(res, limitedPartnerLegalEntity, cyTranslationText);
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
      } else if (key.includes("date_effective_from")) {
        expect(res.text).toContain(formatDate(partner.data[key], translationText));
      } else {
        expect(res.text).toContain(partner.data[key]);
      }
    }
  }
};
