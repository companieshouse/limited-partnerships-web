import request from "supertest";

import enTranslationText from "../../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../../locales/cy/translations.json";

import app from "../../app";
import { appDevDependencies } from "../../../../../config/dev-dependencies";
import { countOccurrences, getUrl, setLocalesEnabled } from "../../../utils";

import CompanyProfileBuilder from "../../../builder/CompanyProfileBuilder";
import {
  REMOVE_LIMITED_PARTNER_LEGAL_ENTITY_CHECK_YOUR_ANSWERS_URL,
  WHEN_DID_THE_LIMITED_PARTNER_LEGAL_ENTITY_CEASE_URL,
  WHEN_DID_THE_LIMITED_PARTNER_LEGAL_ENTITY_CEASE_WITH_IDS_URL
} from "../../../../controller/postTransition/url";
import CompanyAppointmentBuilder from "../../../builder/CompanyAppointmentBuilder";
import PostTransitionPageType from "../../../../controller/postTransition/pageType";
import { PartnerKind } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships/types";
import LimitedPartnerBuilder from "../../../../../presentation/test/builder/LimitedPartnerBuilder";

describe("Limited Partner LegalEntity cease date page", () => {
  const URL = getUrl(WHEN_DID_THE_LIMITED_PARTNER_LEGAL_ENTITY_CEASE_URL);
  const URL_WITH_IDS = getUrl(WHEN_DID_THE_LIMITED_PARTNER_LEGAL_ENTITY_CEASE_WITH_IDS_URL);
  const REDIRECT = getUrl(REMOVE_LIMITED_PARTNER_LEGAL_ENTITY_CHECK_YOUR_ANSWERS_URL);

  let companyProfile;
  let companyAppointment;

  beforeEach(() => {
    setLocalesEnabled(true);

    appDevDependencies.companyGateway.setError(false);
    appDevDependencies.cacheRepository.feedCache(null);

    companyProfile = new CompanyProfileBuilder().build();
    appDevDependencies.companyGateway.feedCompanyProfile(companyProfile.data);

    companyAppointment = new CompanyAppointmentBuilder()
      .withOfficerRole("limited-partner-in-a-limited-partnership")
      .isLegalEntity()
      .build();
    appDevDependencies.companyGateway.feedCompanyAppointments([companyAppointment]);

    appDevDependencies.limitedPartnerGateway.feedLimitedPartners([]);
  });

  describe("GET limited partner legal entity cease date page", () => {
    it("should load limited partner legal entity cease date page with english text", async () => {
      const res = await request(app).get(URL + "?lang=en");

      expect(res.status).toBe(200);
      expect(res.text).toContain(`${enTranslationText.ceaseDate.removeLimitedPartner.title}`);
      expect(res.text).not.toContain("WELSH -");

      expect(res.text).toContain(companyProfile.data.companyName.toUpperCase());
      expect(res.text).toContain(companyAppointment.name?.split(",")[0] ?? "");
      expect(countOccurrences(res.text, enTranslationText.serviceName.removeLimitedPartnerEntity)).toBe(2);
    });

    it("should load limited partner legal entity cease date page with welsh text", async () => {
      const res = await request(app).get(URL + "?lang=cy");

      expect(res.status).toBe(200);
      expect(res.text).toContain(`${cyTranslationText.ceaseDate.removeLimitedPartner.title}`);
      expect(res.text).toContain("WELSH -");
      expect(countOccurrences(res.text, cyTranslationText.serviceName.removeLimitedPartnerEntity)).toBe(2);
    });
  });

  describe("Post limited partner legal entity cease date page", () => {
    it("should send the limited partner legal entity details", async () => {
      const res = await request(app).post(URL).send({
        pageType: PostTransitionPageType.whenDidTheLimitedPartnerLegalEntityCease,

        "cease_date-day": "01",
        "cease_date-month": "01",
        "cease_date-year": "2025",
        remove_confirmation_checked: true
      });

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${REDIRECT}`);

      expect(appDevDependencies.transactionGateway.transactions).toHaveLength(1);
      expect(appDevDependencies.transactionGateway.transactions[0].description).toBe(
        "Remove a limited partner (legal entity)"
      );

      expect(appDevDependencies.limitedPartnerGateway.limitedPartners).toHaveLength(1);
      expect(appDevDependencies.limitedPartnerGateway.limitedPartners[0].data?.kind).toEqual(
        PartnerKind.REMOVE_LIMITED_PARTNER_LEGAL_ENTITY
      );
    });

    it.each([
      ["without ids", false, URL ],
      ["with ids", true, URL_WITH_IDS ]
    ])("should replay entered data when invalid cease date is entered and a validation error occurs %s", async (_description: string, isWithIds: boolean, url: string) => {
      const errorMessage = "The date is not valid";

      let limitedPartner;
      if (isWithIds) {
        limitedPartner = new LimitedPartnerBuilder()
          .withId(appDevDependencies.limitedPartnerGateway.limitedPartnerId)
          .isLegalEntity()
          .build();

        appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartner]);
      }

      const res = await request(app).post(url).send({
        pageType: PostTransitionPageType.whenDidTheLimitedPartnerLegalEntityCease,
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
        expect(res.text).toContain(limitedPartner.data?.legal_entity_name);
      } else {
        expect(res.text).toContain(companyAppointment.name);
      }
      expect(res.text).toContain(errorMessage);

      expect(res.text).toContain('name="remove_confirmation_checked" type="checkbox" value="true" checked');

    });
  });
});
