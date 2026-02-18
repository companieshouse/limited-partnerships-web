import { PartnerKind } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

import request from "supertest";
import enTranslationText from "../../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../../locales/cy/translations.json";
import app from "../../app";
import {
  UPDATE_LIMITED_PARTNER_PERSON_URL,
  UPDATE_LIMITED_PARTNER_PERSON_WITH_IDS_URL,
  UPDATE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_YES_NO_URL,
} from "../../../../controller/postTransition/url";
import { countOccurrences, getUrl, setLocalesEnabled, testTranslations, toEscapedHtml } from "../../../utils";
import CompanyProfileBuilder from "../../../builder/CompanyProfileBuilder";
import CompanyAppointmentBuilder from "../../../builder/CompanyAppointmentBuilder";
import { appDevDependencies } from "../../../../../config/dev-dependencies";
import LimitedPartnerBuilder from "../../../../../presentation/test/builder/LimitedPartnerBuilder";
import PostTransitionPageType from "../../../../../presentation/controller/postTransition/pageType";
import { ApiErrors } from "../../../../../domain/entities/UIErrors";
import { OFFICER_ROLE_LIMITED_PARTNER_PERSON } from "../../../../../config";

describe("Update Limited Partner Person Page", () => {
  const URL = getUrl(UPDATE_LIMITED_PARTNER_PERSON_URL);
  const URL_WITH_IDS = getUrl(UPDATE_LIMITED_PARTNER_PERSON_WITH_IDS_URL);
  const REDIRECT = getUrl(UPDATE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_YES_NO_URL);

  let companyProfile;
  let companyAppointment;

  beforeEach(() => {
    setLocalesEnabled(false);

    companyProfile = new CompanyProfileBuilder().build();
    appDevDependencies.companyGateway.feedCompanyProfile(companyProfile.data);

    appDevDependencies.limitedPartnerGateway.feedLimitedPartners([]);
    appDevDependencies.limitedPartnerGateway.feedErrors();

    appDevDependencies.transactionGateway.feedTransactions([]);
    appDevDependencies.companyGateway.feedCompanyAppointments([]);
  });

  describe("GET update limited partner person page", () => {
    it.each([
      ["English", "en", enTranslationText],
      ["Welsh", "cy", cyTranslationText]
    ])("should load the update limited partner person page with %s text", async (description: string, lang: string, translationText: any) => {
      setLocalesEnabled(true);

      const res = await request(app).get(`${URL}?lang=${lang}`);

      expect(res.status).toBe(200);

      expect(res.text).toContain(
        `${companyProfile.data.companyName?.toUpperCase()} (${companyProfile.data.companyNumber?.toUpperCase()})`
      );

      testTranslations(res.text, translationText.updatePartnerPersonPage, ["generalPartner"]);
      expect(countOccurrences(res.text, toEscapedHtml(translationText.serviceName.updateLimitedPartnerPerson))).toBe(2);

      if (lang === "cy") {
        expect(res.text).toContain("WELSH - ");
      } else {
        expect(res.text).not.toContain("WELSH -");
      }
    });

    it.each([
      ["with appointment id", URL],
      ["with limited partner id", URL_WITH_IDS]
    ])("should load the update limited partner person page and replay saved data %s", async (description: string, url: string) => {
      if (url.includes("/appointment/")) {
        companyAppointment = new CompanyAppointmentBuilder()
          .withOfficerRole(OFFICER_ROLE_LIMITED_PARTNER_PERSON)
          .withName("Doe - LP, Joe - LP")
          .withNationality("British,Irish")
          .build();
        appDevDependencies.companyGateway.feedCompanyAppointments([
          companyAppointment
        ]);
      } else {
        const limitedPartner = new LimitedPartnerBuilder()
          .withId(appDevDependencies.limitedPartnerGateway.limitedPartnerId)
          .isPerson()
          .withNationality1("British")
          .withNationality2("Irish")
          .build();

        appDevDependencies.limitedPartnerGateway.feedLimitedPartners([
          limitedPartner,
        ]);
      }

      setLocalesEnabled(true);
      const res = await request(app).get(url);

      expect(res.status).toBe(200);
      expect(res.text).toContain("Joe - LP");
      expect(res.text).toContain("Doe - LP");
      expect(res.text).toContain('<option value="British" selected>British</option>');
      expect(res.text).toContain('<option value="Irish" selected>Irish</option>');
    });
  });

  describe("POST update limited partner person page", () => {
    it.each([
      ["with appointment id", URL],
      ["with limited partner id", URL_WITH_IDS],
    ])("should send the limited partner person details to API %s", async (description: string, url: string) => {
      expect(appDevDependencies.limitedPartnerGateway.limitedPartners).toHaveLength(0);

      if (url.includes("/limited-partner/")) {
        const limitedPartner = new LimitedPartnerBuilder()
          .withId(appDevDependencies.limitedPartnerGateway.limitedPartnerId)
          .isPerson()
          .withNotDisqualifiedStatementChecked(true)
          .withNationality1("British")
          .withNationality2("Irish")
          .withKind(PartnerKind.UPDATE_LIMITED_PARTNER_PERSON)
          .build();

        appDevDependencies.limitedPartnerGateway.feedLimitedPartners([
          limitedPartner,
        ]);
      }

      const res = await request(app).post(url).send({
        pageType: PostTransitionPageType.updateLimitedPartnerPerson,
        "forename": "John",
        "surname": "Doe",
        "nationality1": "British",
        "nationality2": "Irish"
      });

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${REDIRECT}`);

      expect(appDevDependencies.limitedPartnerGateway.limitedPartners).toHaveLength(1);
      expect(appDevDependencies.limitedPartnerGateway.limitedPartners[0].data?.kind).toEqual(
        PartnerKind.UPDATE_LIMITED_PARTNER_PERSON
      );
      expect(appDevDependencies.limitedPartnerGateway.limitedPartners[0].data?.forename).toEqual("John");
      expect(appDevDependencies.limitedPartnerGateway.limitedPartners[0].data?.surname).toEqual("Doe");
      expect(appDevDependencies.limitedPartnerGateway.limitedPartners[0].data?.nationality1).toEqual("British");
      expect(appDevDependencies.limitedPartnerGateway.limitedPartners[0].data?.nationality2).toEqual("Irish");
    });

    it("should replay entered data when a validation error occurs", async () => {
      const apiErrors: ApiErrors = {
        errors: { forename: "forename is invalid" }
      };
      appDevDependencies.limitedPartnerGateway.feedErrors(apiErrors);

      const res = await request(app).post(URL).send({
        pageType: PostTransitionPageType.updateLimitedPartnerPerson,
        "forename": "INVALID-FORENAME",
        "surname": "Doe",
        "nationality1": "British",
        "nationality2": "Irish"
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain("forename is invalid");
      expect(res.text).toContain("INVALID-FORENAME");
      expect(res.text).toContain("Doe");
      expect(res.text).toContain('<option value="British" selected>British</option>');
      expect(res.text).toContain('<option value="Irish" selected>Irish</option>');
    });
  });

});
