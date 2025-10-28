import request from "supertest";

import enTranslationText from "../../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../../locales/cy/translations.json";

import app from "../../app";
import { appDevDependencies } from "../../../../../config/dev-dependencies";
import { getUrl, setLocalesEnabled } from "../../../utils";

import CompanyProfileBuilder from "../../../builder/CompanyProfileBuilder";
import {
  REMOVE_LIMITED_PARTNER_PERSON_CHECK_YOUR_ANSWERS_URL,
  WHEN_DID_THE_LIMITED_PARTNER_PERSON_CEASE_URL,
  WHEN_DID_THE_LIMITED_PARTNER_PERSON_CEASE_WITH_IDS_URL
} from "../../../../controller/postTransition/url";
import CompanyAppointmentBuilder from "../../../builder/CompanyAppointmentBuilder";
import PostTransitionPageType from "../../../../controller/postTransition/pageType";
import { PartnerKind } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships/types";
import LimitedPartnerBuilder from "presentation/test/builder/LimitedPartnerBuilder";

describe("Limited Partner Person cease date page", () => {
  const URL = getUrl(WHEN_DID_THE_LIMITED_PARTNER_PERSON_CEASE_URL);
  const URL_WITH_IDS = getUrl(WHEN_DID_THE_LIMITED_PARTNER_PERSON_CEASE_WITH_IDS_URL);
  const REDIRECT = getUrl(REMOVE_LIMITED_PARTNER_PERSON_CHECK_YOUR_ANSWERS_URL);

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
      .build();
    appDevDependencies.companyGateway.feedCompanyAppointments([companyAppointment]);

    appDevDependencies.limitedPartnerGateway.feedLimitedPartners([]);
  });

  describe("GET limited partner person cease date page", () => {
    it("should load limited partner person cease date page with english text", async () => {
      const res = await request(app).get(URL + "?lang=en");

      expect(res.status).toBe(200);
      expect(res.text).toContain(`${enTranslationText.ceaseDate.removeLimitedPartner.title}`);
      expect(res.text).not.toContain("WELSH -");

      expect(res.text).toContain(companyProfile.data.companyName.toUpperCase());
      expect(res.text).toContain(companyAppointment.name?.split(",")[0] ?? "");
    });

    it("should load limited partner person cease date page with welsh text", async () => {
      const res = await request(app).get(URL + "?lang=cy");

      expect(res.status).toBe(200);
      expect(res.text).toContain(`${cyTranslationText.ceaseDate.removeLimitedPartner.title}`);
      expect(res.text).toContain("WELSH -");
    });
  });

  describe("Post limited partner person cease date page", () => {
    it("should send the limited partner person details", async () => {
      const res = await request(app).post(URL).send({
        pageType: PostTransitionPageType.whenDidTheLimitedPartnerPersonCease,

        "cease_date-day": "01",
        "cease_date-month": "01",
        "cease_date-year": "2025",
        remove_confirmation_checked: true
      });

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${REDIRECT}`);

      expect(appDevDependencies.transactionGateway.transactions).toHaveLength(1);
      expect(appDevDependencies.transactionGateway.transactions[0].description).toBe(
        "Remove a limited partner (person)"
      );

      expect(appDevDependencies.limitedPartnerGateway.limitedPartners).toHaveLength(1);
      expect(appDevDependencies.limitedPartnerGateway.limitedPartners[0].data?.kind).toEqual(
        PartnerKind.REMOVE_LIMITED_PARTNER_PERSON
      );
    });

    it.each([
      ["without ids", false, URL ],
      ["with ids", true, URL_WITH_IDS ]
    ])("should replay entered data when invalid cease date is entered and a validation error occurs %s", async (description: string, isWithIds: boolean, url: string) => {
      const errorMessage = "The date is not valid";

      if (isWithIds) {
        const limitedPartner = new LimitedPartnerBuilder()
          .withId(appDevDependencies.limitedPartnerGateway.limitedPartnerId)
          .isPerson()
          .build();

        appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartner]);
      }

      // Use date values that don't appear elsewhere in the HTML to ensure they are being
      // pulled from the submitted form data
      const res = await request(app).post(url).send({
        pageType: PostTransitionPageType.whenDidTheLimitedPartnerPersonCease,
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
        expect(res.text.match(/Joe - LP Doe - LP/g)).toHaveLength(2);
      } else {
        expect(res.text).toContain("Test Partner Appointment");
      }
      expect(res.text).toContain(errorMessage);

      expect(res.text).toContain('name="remove_confirmation_checked" type="checkbox" value="true" checked');
    });

  });
});
