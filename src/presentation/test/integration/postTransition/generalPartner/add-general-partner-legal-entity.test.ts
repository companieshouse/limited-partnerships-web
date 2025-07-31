import request from "supertest";

import enTranslationText from "../../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../../locales/cy/translations.json";

import app from "../../app";
import { appDevDependencies } from "../../../../../config/dev-dependencies";
import { getUrl, setLocalesEnabled, testTranslations } from "../../../utils";
import { ApiErrors } from "../../../../../domain/entities/UIErrors";

import PostTransitionPageType from "../../../../controller/postTransition/pageType";
import {
  ADD_GENERAL_PARTNER_LEGAL_ENTITY_URL,
  ADD_GENERAL_PARTNER_LEGAL_ENTITY_WITH_ID_URL
} from "../../../../controller/postTransition/url";
import {
  APPLICATION_CACHE_KEY_PREFIX_POST_TRANSITION,
  POST_TRANSITION_BASE_URL
} from "../../../../../config/constants";

import GeneralPartnerBuilder from "../../../builder/GeneralPartnerBuilder";
import CompanyProfileBuilder from "../../../builder/CompanyProfileBuilder";

describe("Add General Partner Legal Entity Page", () => {
  const URL = getUrl(ADD_GENERAL_PARTNER_LEGAL_ENTITY_URL);
  // const REDIRECT_URL = getUrl(TERRITORY_CHOICE_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL); // TODO - uncomment when the URL is available

  let companyProfile;

  beforeEach(() => {
    setLocalesEnabled(false);

    companyProfile = new CompanyProfileBuilder().build();
    appDevDependencies.companyGateway.feedCompanyProfile(companyProfile.data);

    appDevDependencies.cacheRepository.feedCache({
      [`${APPLICATION_CACHE_KEY_PREFIX_POST_TRANSITION}company_number`]: companyProfile.data.companyNumber
    });

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

      testTranslations(res.text, enTranslationText.addPartnerLegalEntityPage, ["limitedPartner", "errorMessages"]);
      testTranslations(res.text, enTranslationText.generalPartnersPage, [
        "title",
        "pageInformation",
        "disqualificationStatement",
        "disqualificationStatementLegend"
      ]);
      expect(res.text).not.toContain("WELSH -");
    });

    it("should load the add general partner legal entity page with Welsh text", async () => {
      setLocalesEnabled(true);

      const res = await request(app).get(URL + "?lang=cy");

      expect(res.status).toBe(200);

      expect(res.text).toContain(
        `${companyProfile.data.companyName?.toUpperCase()} (${companyProfile.data.companyNumber?.toUpperCase()})`
      );

      testTranslations(res.text, cyTranslationText.addPartnerLegalEntityPage, ["limitedPartner", "errorMessages"]);
      testTranslations(res.text, cyTranslationText.generalPartnersPage, [
        "title",
        "pageInformation",
        "disqualificationStatement",
        "disqualificationStatementLegend"
      ]);
    });

    it("should contain a back link to the choice page when general partners are not present", async () => {
      const res = await request(app).get(getUrl(ADD_GENERAL_PARTNER_LEGAL_ENTITY_WITH_ID_URL) + "?lang=en");

      expect(res.status).toBe(200);
      const regex = new RegExp(`${POST_TRANSITION_BASE_URL}/${PostTransitionPageType.generalPartnerChoice}`);
      expect(res.text).toMatch(regex);
    });
  });

  describe("Post Add General Partner Legal Entity", () => {
    it("should send the general partner legal entity details", async () => {
      const generalPartner = new GeneralPartnerBuilder().isLegalEntity().build();

      const res = await request(app)
        .post(URL)
        .send({
          pageType: PostTransitionPageType.addGeneralPartnerLegalEntity,
          ...generalPartner.data
        });

      expect(res.status).toBe(302);
      // expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`); // TODO - uncomment when the URL is available

      expect(appDevDependencies.transactionGateway.transactions).toHaveLength(1);
      expect(appDevDependencies.transactionGateway.transactions[0].description).toBe(
        "Add a general partner (legal entity)"
      );

      expect(appDevDependencies.generalPartnerGateway.generalPartners).toHaveLength(1);
      expect(appDevDependencies.generalPartnerGateway.generalPartners[0].data?.kind).toEqual(
        "limited-partnership#general-partner-legal-entity"
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

    it("should send the general partner details and go to confirm ura address page if already saved", async () => {
      const generalPartner = new GeneralPartnerBuilder()
        .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
        .isLegalEntity()
        .build();

      appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartner]);

      const URL = getUrl(ADD_GENERAL_PARTNER_LEGAL_ENTITY_WITH_ID_URL);

      const res = await request(app)
        .post(URL)
        .send({
          pageType: PostTransitionPageType.addGeneralPartnerLegalEntity,
          ...generalPartner.data
        });

      // const REDIRECT_URL = getUrl(CONFIRM_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL); // TODO - uncomment when the URL is available

      expect(res.status).toBe(302);
      // expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`); // TODO - uncomment when the URL is available
    });
  });
});
