import request from "supertest";

import enTranslationText from "../../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../../locales/cy/translations.json";
import enErrorMessages from "../../../../../../locales/en/errors.json";

import app from "../../app";

import GeneralPartnerBuilder from "../../../builder/GeneralPartnerBuilder";
import { appDevDependencies } from "../../../../../config/dev-dependencies";
import { countOccurrences, getUrl, setLocalesEnabled, toEscapedHtml } from "../../../utils";
import CompanyProfileBuilder from "../../../builder/CompanyProfileBuilder";
import {
  UPDATE_GENERAL_PARTNER_LEGAL_ENTITY_CHECK_YOUR_ANSWERS_URL,
  UPDATE_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_YES_NO_URL,
  WHEN_DID_GENERAL_PARTNER_LEGAL_ENTITY_DETAILS_CHANGE_URL
} from "../../../../../presentation/controller/postTransition/url";
import PostTransitionPageType from "../../../../controller/postTransition/pageType";
import { ApiErrors } from "domain/entities/UIErrors";
import { PartnerKind } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";
import TransactionBuilder from "../../../builder/TransactionBuilder";

describe("General partner legal entity change date page", () => {
  const URL = getUrl(WHEN_DID_GENERAL_PARTNER_LEGAL_ENTITY_DETAILS_CHANGE_URL);
  const BACK_LINK_URL = getUrl(UPDATE_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_YES_NO_URL);

  let generalPartner;

  beforeEach(() => {
    setLocalesEnabled(false);
    generalPartner = new GeneralPartnerBuilder()
      .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
      .isLegalEntity()
      .build();

    appDevDependencies.generalPartnerGateway.feedGeneralPartners([
      generalPartner,
    ]);

    const companyProfile = new CompanyProfileBuilder().build();
    appDevDependencies.companyGateway.feedCompanyProfile(companyProfile.data);

    const transaction = new TransactionBuilder().withKind(PartnerKind.UPDATE_GENERAL_PARTNER_LEGAL_ENTITY).build();
    appDevDependencies.transactionGateway.feedTransactions([transaction]);
  });

  describe("GET general partner legal entity change date page", () => {
    it.each([
      ["English", "en"],
      ["Welsh", "cy"]
    ])("should load general partner legal entity change date page with %s text", async (_description: string, lang: string) => {
      setLocalesEnabled(true);
      const res = await request(app).get(`${URL}?lang=${lang}`);

      expect(res.status).toBe(200);
      expect(res.text).toContain(BACK_LINK_URL);
      expect(res.text).toContain(`${generalPartner.data?.legal_entity_name?.toUpperCase()}`);

      if (lang === "cy") {
        expect(res.text).toContain("WELSH - ");
        expect(res.text).toContain(`${cyTranslationText.dateOfUpdate.generalPartner.title}`);
        expect(countOccurrences(res.text, toEscapedHtml(cyTranslationText.serviceName.updateGeneralPartnerLegalEntity))).toBe(2);
      } else {
        expect(res.text).not.toContain("WELSH -");
        expect(res.text).toContain(`${enTranslationText.dateOfUpdate.generalPartner.title}`);
        expect(countOccurrences(res.text, toEscapedHtml(enTranslationText.serviceName.updateGeneralPartnerLegalEntity))).toBe(2);
      }
    });

    it("should populate the date fields with the existing date of update if it exists", async () => {
      const generalPartner = new GeneralPartnerBuilder()
        .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
        .isLegalEntity()
        .withDateOfUpdate("2024-10-10")
        .build();

      appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartner]);

      const res = await request(app).get(URL);

      expect(res.status).toBe(200);
      expect(res.text).toMatch(/<input[^>]*name="date_of_update-year"[^>]*value="2024"[^>]*>/);
      expect(res.text).toMatch(/<input[^>]*name="date_of_update-month"[^>]*value="10"[^>]*>/);
      expect(res.text).toMatch(/<input[^>]*name="date_of_update-day"[^>]*value="10"[^>]*>/);
    });
  });

  describe("POST general partner legal entity change date page", () => {
    it("should navigate to next page with date of update", async () => {
      const generalPartner = new GeneralPartnerBuilder()
        .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
        .isLegalEntity()
        .withDateOfUpdate("2024-10-10")
        .build();

      appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartner]);

      const res = await request(app).post(URL).send({
        pageType: PostTransitionPageType.whenDidGeneralPartnerLegalEntityDetailsChange
      });

      const REDIRECT_URL = getUrl(UPDATE_GENERAL_PARTNER_LEGAL_ENTITY_CHECK_YOUR_ANSWERS_URL);

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);
    });

    it("should display the specifc error message rather than the original when the date is before the incorporation date", async () => {
      const generalPartner = new GeneralPartnerBuilder()
        .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
        .isLegalEntity()
        .withDateOfUpdate("2024-10-10")
        .build();

      appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartner]);

      const originalErrorMessage = "Default";
      const expectedErrorMessage = toEscapedHtml(enErrorMessages.errorMessages.dateOfUpdate.generalPartner);
      const apiErrors: ApiErrors = {
        errors: { date_of_update: originalErrorMessage }
      };
      appDevDependencies.generalPartnerGateway.feedErrors(apiErrors);

      const res = await request(app).post(URL).send({
        pageType: PostTransitionPageType.whenDidGeneralPartnerLegalEntityDetailsChange,
        "date_of_update-day": "10",
        "date_of_update-month": "01",
        "date_of_update-year": "2000"
      });

      expect(res.status).toBe(200);
      expect(res.text).not.toContain(originalErrorMessage);
      expect(res.text).toContain(expectedErrorMessage);
      expect(res.text).toContain("10");
      expect(res.text).toContain("01");
      expect(res.text).toContain("2000");
      expect(res.text).toContain(BACK_LINK_URL);
      expect(res.text).toContain(`${generalPartner.data?.legal_entity_name?.toUpperCase()}`);
    });
  });
});
