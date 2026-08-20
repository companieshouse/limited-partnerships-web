import request from "supertest";

import app from "../../app";
import { appDevDependencies } from "../../../../../config/dev-dependencies";
import { countOccurrences, getUrl, setLocalesEnabled, testTranslations, toEscapedHtml } from "../../../utils";
import { ApiErrors } from "../../../../../domain/entities/UIErrors";

import PostTransitionPageType from "../../../../controller/postTransition/pageType";
import {
  ADD_GENERAL_PARTNER_LEGAL_ENTITY_URL,
  ADD_GENERAL_PARTNER_LEGAL_ENTITY_WITH_IDS_URL,
  GENERAL_PARTNER_CHOICE_URL
} from "../../../../controller/postTransition/url";

import GeneralPartnerBuilder from "../../../builder/GeneralPartnerBuilder";
import CompanyProfileBuilder from "../../../builder/CompanyProfileBuilder";
import { PartnerKind } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships/types";
import { CONFIRM_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL, TERRITORY_CHOICE_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL } from "../../../../controller/addressLookUp/url/postTransition";
import { customerFeedbackUrlMap } from "../../../../../middlewares/customer-feedback.middleware";
import { enTranslationText, cyTranslationText } from "../../../../../test/utils/locales";
import PostTransitionRouting from "../../../../controller/postTransition/routing";

describe("Add General Partner Legal Entity Page", () => {
  const URL = getUrl(ADD_GENERAL_PARTNER_LEGAL_ENTITY_URL);
  const REDIRECT_URL = getUrl(TERRITORY_CHOICE_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL);

  let companyProfile;

  beforeEach(() => {
    setLocalesEnabled(false);

    companyProfile = new CompanyProfileBuilder().build();
    appDevDependencies.companyGateway.feedCompanyProfile(companyProfile.data);

    appDevDependencies.generalPartnerGateway.feedGeneralPartners([]);
    appDevDependencies.generalPartnerGateway.feedErrors();

    appDevDependencies.transactionGateway.feedTransactions([]);
  });

  describe("Get Add General Partner Legal Entity Page", () => {
    it("should load the add general partner legal entity page with English text", async () => {
      setLocalesEnabled(true);

      const res = await request(app).get(URL + "?lang=en");

      expect(res.status).toBe(200);

      expect(res.text).toContain(
        `${companyProfile.data.companyName?.toUpperCase()} (${companyProfile.data.companyNumber?.toUpperCase()})`
      );

      testTranslations(res.text, enTranslationText.partner.addOrUpdatePartnerLegalEntityPage, ["updateTitle", "limitedPartner", "errorMessages"]);
      testTranslations(res.text, enTranslationText.partner.generalPartnersPage, [
        "title",
        "pageInformation",
        "disqualificationStatement",
        "disqualificationStatementLegend"
      ]);
      expect(res.text).not.toContain("WELSH -");
      expect(countOccurrences(res.text, enTranslationText.serviceName.addGeneralPartner)).toBe(4);
      expect(res.text).toContain(customerFeedbackUrlMap.addGeneralPartner);
    });

    it("should load the add general partner legal entity page with Welsh text", async () => {
      setLocalesEnabled(true);

      const res = await request(app).get(URL + "?lang=cy");

      expect(res.status).toBe(200);

      expect(res.text).toContain(
        `${companyProfile.data.companyName?.toUpperCase()} (${companyProfile.data.companyNumber?.toUpperCase()})`
      );

      testTranslations(res.text, cyTranslationText.partner.addOrUpdatePartnerLegalEntityPage, ["updateTitle", "limitedPartner", "errorMessages"]);
      testTranslations(res.text, cyTranslationText.partner.generalPartnersPage, [
        "title",
        "pageInformation",
        "disqualificationStatement",
        "disqualificationStatementLegend"
      ]);
      expect(countOccurrences(res.text, cyTranslationText.serviceName.addGeneralPartner)).toBe(4);
      expect(res.text).toContain(customerFeedbackUrlMap.addGeneralPartner);
    });

    it("should contain a back link to the choice page when general partners are not present", async () => {
      const generalPartner = new GeneralPartnerBuilder()
        .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
        .isLegalEntity()
        .build();

      appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartner]);

      const res = await request(app).get(getUrl(ADD_GENERAL_PARTNER_LEGAL_ENTITY_WITH_IDS_URL) + "?lang=en");

      const BACK_LINK = getUrl(GENERAL_PARTNER_CHOICE_URL);

      expect(res.status).toBe(200);
      expect(res.text).toContain(BACK_LINK);
    });
  });

  describe("Post Add General Partner Legal Entity", () => {
    it("should send the general partner legal entity details", async () => {
      const generalPartner = new GeneralPartnerBuilder().isLegalEntity().build();

      const today = new Date();
      const day = today.getDate().toString().padStart(2, "0");
      const month = (today.getMonth() + 1).toString().padStart(2, "0");
      const year = today.getFullYear().toString();

      const res = await request(app)
        .post(URL)
        .send({
          ...PostTransitionRouting.get(PostTransitionPageType.addGeneralPartnerLegalEntity),
          ...generalPartner.data,
          "date_effective_from-day": day,
          "date_effective_from-month": month,
          "date_effective_from-year": year
        });

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);

      expect(appDevDependencies.transactionGateway.transactions).toHaveLength(1);
      expect(appDevDependencies.transactionGateway.transactions[0].description).toBe(
        "Add a general partner (legal entity)"
      );

      expect(appDevDependencies.generalPartnerGateway.generalPartners).toHaveLength(1);
      expect(appDevDependencies.generalPartnerGateway.generalPartners[0].data?.kind).toEqual(
        PartnerKind.ADD_GENERAL_PARTNER_LEGAL_ENTITY
      );
    });

    it("should return a validation error when invalid data is entered", async () => {
      const apiErrors: ApiErrors = {
        errors: { legal_entity_name: "Legal entity name is invalid" }
      };

      appDevDependencies.generalPartnerGateway.feedErrors(apiErrors);

      const res = await request(app).post(URL).send({
        pageType: PostTransitionPageType.addGeneralPartnerLegalEntity,
        legal_entity_name: "INVALID-CHARACTERS"
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain("Legal entity name is invalid");
    });

    it("should return a validation error when date effective from is %s", async () => {
      const res = await request(app)
        .post(URL)
        .send({
          ...PostTransitionRouting.get(PostTransitionPageType.addGeneralPartnerLegalEntity),
          "date_effective_from-day": "222",
          "date_effective_from-month": "10",
          "date_effective_from-year": "2024"
        });

      expect(res.status).toBe(200);
      expect(res.text).toContain(enTranslationText.errorMessages.dateEffectiveFrom.dayInvalidLength);
    });

    it("should return a validation error when date effective from is before registration date", async () => {
      const res = await request(app)
        .post(URL)
        .send({
          ...PostTransitionRouting.get(PostTransitionPageType.addGeneralPartnerLegalEntity),
          "date_effective_from-day": "22",
          "date_effective_from-month": "10",
          "date_effective_from-year": "2011"
        });

      expect(res.status).toBe(200);
      expect(res.text).toContain(toEscapedHtml(enTranslationText.errorMessages.dateEffectiveFrom.beforeRegistrationDate));
    });

    it("should send the general partner details and go to confirm principal office address page if already saved", async () => {
      const generalPartner = new GeneralPartnerBuilder()
        .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
        .isLegalEntity()
        .build();

      appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartner]);

      const URL = getUrl(ADD_GENERAL_PARTNER_LEGAL_ENTITY_WITH_IDS_URL);

      const res = await request(app)
        .post(URL)
        .send({
          pageType: PostTransitionPageType.addGeneralPartnerLegalEntity,
          ...generalPartner.data,
          "date_effective_from-day": "01",
          "date_effective_from-month": "10",
          "date_effective_from-year": "2024"
        });

      const REDIRECT_URL = getUrl(CONFIRM_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL);

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);
    });
  });
});
