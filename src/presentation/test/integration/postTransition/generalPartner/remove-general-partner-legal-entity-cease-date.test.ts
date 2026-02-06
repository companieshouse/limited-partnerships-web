import request from "supertest";

import enTranslationText from "../../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../../locales/cy/translations.json";

import app from "../../app";
import { appDevDependencies } from "../../../../../config/dev-dependencies";
import { countOccurrences, getUrl, setLocalesEnabled } from "../../../utils";

import CompanyProfileBuilder from "../../../builder/CompanyProfileBuilder";
import {
  REMOVE_GENERAL_PARTNER_LEGAL_ENTITY_CHECK_YOUR_ANSWERS_URL,
  WHEN_DID_THE_GENERAL_PARTNER_LEGAL_ENTITY_CEASE_URL,
  WHEN_DID_THE_GENERAL_PARTNER_LEGAL_ENTITY_CEASE_WITH_IDS_URL
} from "../../../../controller/postTransition/url";
import CompanyAppointmentBuilder from "../../../builder/CompanyAppointmentBuilder";
import PostTransitionPageType from "../../../../controller/postTransition/pageType";
import { PartnerKind } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships/types";
import GeneralPartnerBuilder from "../../../../../presentation/test/builder/GeneralPartnerBuilder";
import { OFFICER_ROLE_GENERAL_PARTNER_LEGAL_ENTITY } from "../../../../../config";

describe("General Partner cease date page", () => {
  const URL = getUrl(WHEN_DID_THE_GENERAL_PARTNER_LEGAL_ENTITY_CEASE_URL);
  const URL_WITH_IDS = getUrl(WHEN_DID_THE_GENERAL_PARTNER_LEGAL_ENTITY_CEASE_WITH_IDS_URL);
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
      .withOfficerRole(OFFICER_ROLE_GENERAL_PARTNER_LEGAL_ENTITY)
      .isLegalEntity()
      .build();
    appDevDependencies.companyGateway.feedCompanyAppointments([companyAppointment]);

    appDevDependencies.generalPartnerGateway.feedGeneralPartners([]);
  });

  describe("GET general partner cease date page", () => {
    it("should load general partner cease date page with english text", async () => {
      const res = await request(app).get(URL + "?lang=en");

      expect(res.status).toBe(200);
      expect(res.text).toContain(`${enTranslationText.ceaseDate.removeGeneralPartner.title}`);
      expect(res.text).not.toContain("WELSH -");

      expect(res.text).toContain(companyProfile.data.companyName.toUpperCase());
      expect(res.text).toContain(companyAppointment.name?.split(",")[0] ?? "");
      expect(countOccurrences(res.text, enTranslationText.serviceName.removeGeneralPartnerEntity)).toBe(2);
    });

    it("should load general partner cease date page with welsh text", async () => {
      const res = await request(app).get(URL + "?lang=cy");

      expect(res.status).toBe(200);
      expect(res.text).toContain(`${cyTranslationText.ceaseDate.removeGeneralPartner.title}`);
      expect(res.text).toContain("WELSH -");
      expect(countOccurrences(res.text, cyTranslationText.serviceName.removeGeneralPartnerEntity)).toBe(2);
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

    it.each([
      ["without ids", false, URL ],
      ["with ids", true, URL_WITH_IDS ]
    ])("should replay entered data when invalid cease date is entered and a validation error occurs %s", async (description: string, isWithIds: boolean, url: string) => {
      const errorMessage = "The date is not valid";

      let generalPartner;

      if (isWithIds) {
        generalPartner = new GeneralPartnerBuilder()
          .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
          .isLegalEntity()
          .build();

        appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartner]);
      }

      // Use date values that don't appear elsewhere in the HTML to ensure they are being
      // pulled from the submitted form data
      const res = await request(app).post(url).send({
        pageType: PostTransitionPageType.whenDidTheGeneralPartnerLegalEntityCease,
        "cease_date-day": "DAY_41",
        "cease_date-month": "MONTH_01",
        "cease_date-year": "YEAR_2025",
        remove_confirmation_checked: true
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain("DAY_41");
      expect(res.text).toContain("MONTH_01");
      expect(res.text).toContain("YEAR_2025");
      if (isWithIds) {
        expect(res.text).toContain(generalPartner.data?.legal_entity_name);
      } else {
        expect(res.text).toContain(companyAppointment.name);
      }
      expect(res.text).toContain(errorMessage);

      expect(res.text).toContain('name="remove_confirmation_checked" type="checkbox" value="true" checked');
    });
  });
});
