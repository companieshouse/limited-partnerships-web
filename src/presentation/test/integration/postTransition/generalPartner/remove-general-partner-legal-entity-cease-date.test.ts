import request from "supertest";

import enTranslationText from "../../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../../locales/cy/translations.json";

import app from "../../app";
import { appDevDependencies } from "../../../../../config/dev-dependencies";
import { getUrl, setLocalesEnabled } from "../../../utils";

import CompanyProfileBuilder from "../../../builder/CompanyProfileBuilder";
import {
  REMOVE_GENERAL_PARTNER_LEGAL_ENTITY_CHECK_YOUR_ANSWERS_URL,
  WHEN_DID_THE_GENERAL_PARTNER_LEGAL_ENTITY_CEASE_URL
} from "../../../../controller/postTransition/url";
import CompanyAppointmentBuilder from "../../../builder/CompanyAppointmentBuilder";
import PostTransitionPageType from "../../../../controller/postTransition/pageType";
import { PartnerKind } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships/types";

describe("General Partner cease date page", () => {
  const URL = getUrl(WHEN_DID_THE_GENERAL_PARTNER_LEGAL_ENTITY_CEASE_URL);
  const REDIRECT = getUrl(REMOVE_GENERAL_PARTNER_LEGAL_ENTITY_CHECK_YOUR_ANSWERS_URL);

  let companyProfile;
  let companyAppointment;

  beforeEach(() => {
    setLocalesEnabled(true);

    appDevDependencies.companyGateway.setError(false);
    appDevDependencies.cacheRepository.feedCache(null);

    companyProfile = new CompanyProfileBuilder().build();
    appDevDependencies.companyGateway.feedCompanyProfile(companyProfile.data);

    companyAppointment = new CompanyAppointmentBuilder()
      .withOfficerRole("general-partner-in-a-limited-partnership")
      .build();
    appDevDependencies.companyGateway.feedCompanyAppointments([companyAppointment]);
  });

  describe("GET general partner cease date page", () => {
    it("should load general partner cease date page with english text", async () => {
      const res = await request(app).get(URL + "?lang=en");

      expect(res.status).toBe(200);
      expect(res.text).toContain(`${enTranslationText.ceaseDate.removeGeneralPartner.title}`);
      expect(res.text).not.toContain("WELSH -");

      expect(res.text).toContain(companyProfile.data.companyName.toUpperCase());
      expect(res.text).toContain(companyAppointment.name?.split(",")[0] ?? "");
    });

    it("should load general partner cease date page with welsh text", async () => {
      const res = await request(app).get(URL + "?lang=cy");

      expect(res.status).toBe(200);
      expect(res.text).toContain(`${cyTranslationText.ceaseDate.removeGeneralPartner.title}`);
      expect(res.text).toContain("WELSH -");
    });
  });

  describe("Post general partner cease date page", () => {
    it("should send the general partner legal entity details", async () => {
      const res = await request(app).post(URL).send({
        pageType: PostTransitionPageType.whenDidTheGeneralPartnerLegalEntityCease,

        "cease_date-day": "01",
        "cease_date-month": "01",
        "cease_date-year": "2025",
        remove_confirmation_checked: true
      });

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${REDIRECT}`);

      expect(appDevDependencies.transactionGateway.transactions).toHaveLength(1);
      expect(appDevDependencies.transactionGateway.transactions[0].description).toBe(
        "Remove a general partner (legal entity)"
      );

      expect(appDevDependencies.generalPartnerGateway.generalPartners).toHaveLength(1);
      expect(appDevDependencies.generalPartnerGateway.generalPartners[0].data?.kind).toEqual(
        PartnerKind.REMOVE_GENERAL_PARTNER_LEGAL_ENTITY
      );
    });
  });
});
