import request from "supertest";

import app from "../../app";
import { appDevDependencies } from "../../../../../config/dev-dependencies";
import { countOccurrences, getUrl, setLocalesEnabled, testTranslations } from "../../../utils";

import CompanyProfileBuilder from "../../../builder/CompanyProfileBuilder";
import {
  REMOVE_GENERAL_PARTNER_PERSON_CHECK_YOUR_ANSWERS_URL,
  WHEN_DID_THE_GENERAL_PARTNER_PERSON_CEASE_URL,
  WHEN_DID_THE_GENERAL_PARTNER_PERSON_CEASE_WITH_IDS_URL
} from "../../../../controller/postTransition/url";
import CompanyAppointmentBuilder from "../../../builder/CompanyAppointmentBuilder";
import PostTransitionPageType from "../../../../controller/postTransition/pageType";
import { PartnerKind } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships/types";
import GeneralPartnerBuilder from "../../../../../presentation/test/builder/GeneralPartnerBuilder";
import { OFFICER_ROLE_GENERAL_PARTNER_PERSON, YOUR_COMPANY_OFFICERS_URL } from "../../../../../config";
import { customerFeedbackUrlMap } from "../../../../../middlewares/customer-feedback.middleware";
import { enTranslationText, cyTranslationText } from "../../../../../test/utils/locales";
import PostTransitionRouting from "../../../../controller/postTransition/routing";

describe("General Partner cease date page", () => {
  const URL = getUrl(WHEN_DID_THE_GENERAL_PARTNER_PERSON_CEASE_URL);
  const URL_WITH_IDS = getUrl(WHEN_DID_THE_GENERAL_PARTNER_PERSON_CEASE_WITH_IDS_URL);
  const REDIRECT = getUrl(REMOVE_GENERAL_PARTNER_PERSON_CHECK_YOUR_ANSWERS_URL);
  const BACK_LINK = getUrl(YOUR_COMPANY_OFFICERS_URL);

  let companyProfile;
  let companyAppointment;

  beforeEach(() => {
    setLocalesEnabled(true);

    appDevDependencies.companyGateway.setError(false);
    appDevDependencies.cacheRepository.feedCache(null);

    companyProfile = new CompanyProfileBuilder().build();
    appDevDependencies.companyGateway.feedCompanyProfile(companyProfile.data);

    companyAppointment = new CompanyAppointmentBuilder()
      .withOfficerRole(OFFICER_ROLE_GENERAL_PARTNER_PERSON)
      .isPerson()
      .build();
    appDevDependencies.companyGateway.feedCompanyAppointments([companyAppointment]);

    appDevDependencies.generalPartnerGateway.feedGeneralPartners([]);
  });

  describe("GET general partner cease date page", () => {
    it.each([
      ["en", enTranslationText],
      ["cy", cyTranslationText]
    ])("should load general partner cease date page with %s text", async (lang: string, translationText: any) => {
      const res = await request(app).get(URL + `?lang=${lang}`);

      expect(res.status).toBe(200);
      testTranslations(res.text, translationText.partner.ceaseDate.removeGeneralPartner, ["legalEntity"]);

      expect(res.text).toContain(companyProfile.data.companyName.toUpperCase());
      expect(res.text).toContain(companyAppointment.name?.split(",")[0] ?? "");
      expect(countOccurrences(res.text, translationText.serviceName.removeGeneralPartnerPerson)).toBe(2);
      expect(res.text).toContain(customerFeedbackUrlMap.removeGeneralPartnerPerson);
      expect(res.text).toContain(BACK_LINK);
    });
  });

  describe("Post general partner cease date page", () => {
    it("should send the general partner person details", async () => {
      const res = await request(app).post(URL).send({
        pageType: PostTransitionPageType.whenDidTheGeneralPartnerPersonCease,

        "cease_date-day": "01",
        "cease_date-month": "01",
        "cease_date-year": "2025",
        remove_confirmation_checked: true
      });

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${REDIRECT}`);

      expect(appDevDependencies.transactionGateway.transactions).toHaveLength(1);
      expect(appDevDependencies.transactionGateway.transactions[0].description).toBe(
        "Remove a general partner (person)"
      );

      expect(appDevDependencies.generalPartnerGateway.generalPartners).toHaveLength(1);
      expect(appDevDependencies.generalPartnerGateway.generalPartners[0].data?.kind).toEqual(
        PartnerKind.REMOVE_GENERAL_PARTNER_PERSON
      );
    });

    it.each([
      ["without ids", false, URL],
      ["with ids", true, URL_WITH_IDS]
    ])(
      "should replay entered data when invalid cease date is entered and a validation error occurs %s",
      async (description: string, isWithIds: boolean, url: string) => {
        let generalPartner;
        if (isWithIds) {
          generalPartner = new GeneralPartnerBuilder()
            .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
            .isPerson()
            .build();

          appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartner]);
        }

        // Use date values that don't appear elsewhere in the HTML to ensure they are being
        // pulled from the submitted form data
        const res = await request(app)
          .post(url)
          .send({
            ...PostTransitionRouting?.get(PostTransitionPageType?.whenDidTheGeneralPartnerPersonCease),
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
          expect(res.text).toContain(generalPartner.data?.forename + " " + generalPartner.data?.surname);
        } else {
          expect(res.text).toContain(companyAppointment.name.split(",")[0]);
        }
        expect(res.text).toContain(enTranslationText.errorMessages.ceaseDate.dayInvalidLength);

        expect(res.text).toContain('name="remove_confirmation_checked" type="checkbox" value="true" checked');
      }
    );
  });
});
