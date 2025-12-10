import { PartnerKind } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

import request from "supertest";
import enTranslationText from "../../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../../locales/cy/translations.json";
import app from "../../app";
import {
  UPDATE_GENERAL_PARTNER_PERSON_URL,
  UPDATE_GENERAL_PARTNER_PERSON_WITH_IDS_URL,
  UPDATE_USUAL_RESIDENTIAL_ADDRESS_YES_NO_URL,
} from "../../../../controller/postTransition/url";
import { getUrl, setLocalesEnabled, testTranslations } from "../../../utils";
import CompanyProfileBuilder from "../../../builder/CompanyProfileBuilder";
import CompanyAppointmentBuilder from "../../../builder/CompanyAppointmentBuilder";
import { appDevDependencies } from "../../../../../config/dev-dependencies";
import GeneralPartnerBuilder from "../../../../../presentation/test/builder/GeneralPartnerBuilder";
import PostTransitionPageType from "../../../../../presentation/controller/postTransition/pageType";
import { ApiErrors } from "../../../../../domain/entities/UIErrors";

describe("Update General Partner Legal Entity Page", () => {
  const URL = getUrl(UPDATE_GENERAL_PARTNER_PERSON_URL);
  const URL_WITH_IDS = getUrl(UPDATE_GENERAL_PARTNER_PERSON_WITH_IDS_URL);
  const REDIRECT = getUrl(UPDATE_USUAL_RESIDENTIAL_ADDRESS_YES_NO_URL);

  let companyProfile;
  let companyAppointment;

  beforeEach(() => {
    setLocalesEnabled(false);

    companyProfile = new CompanyProfileBuilder().build();
    appDevDependencies.companyGateway.feedCompanyProfile(companyProfile.data);

    appDevDependencies.generalPartnerGateway.feedGeneralPartners([]);
    appDevDependencies.generalPartnerGateway.feedErrors();

    appDevDependencies.transactionGateway.feedTransactions([]);
    appDevDependencies.companyGateway.feedCompanyAppointments([]);
  });

  describe("Update general partner person page", () => {

    describe("GET general partner cease date page", () => {

      it.each([
        ["English", "en", enTranslationText],
        ["Welsh", "cy", cyTranslationText]
      ])("should load the update general partner legal entity page with %s text", async (_description: string, lang: string, translationText: any) => {
        setLocalesEnabled(true);

        const res = await request(app).get(`${URL}?lang=${lang}`);

        expect(res.status).toBe(200);

        expect(res.text).toContain(
          `${companyProfile.data.companyName?.toUpperCase()} (${companyProfile.data.companyNumber?.toUpperCase()})`
        );

        testTranslations(res.text, translationText.updatePartnerPersonPage, [
          "limitedPartner",
          "errorMessages",
        ]);

        if (lang === "cy") {
          expect(res.text).toContain("WELSH - ");
        } else {
          expect(res.text).not.toContain("WELSH -");
        }
      });

      it("should contain the partnership name", async () => {
        const res = await request(app).get(URL);

        expect(res.status).toBe(200);
        expect(res.text).toContain(
          `${companyProfile.data.companyName.toUpperCase()} (${companyProfile.data.companyNumber.toUpperCase()})`
        );
      });

      it.each([
        ["with appointment id", URL],
        ["with general partner id", URL_WITH_IDS]
      ])("should load the update general partner person page and replay saved data %s", async (_description: string, url: string) => {
        if (url.includes("/appointment/")) {
          companyAppointment = new CompanyAppointmentBuilder()
            .withOfficerRole("general-partner-in-a-limited-partnership")
            .withName("Doe - GP, Joe - GP")
            .withNationality("British,Irish")
            .build();
          appDevDependencies.companyGateway.feedCompanyAppointments([
            companyAppointment,
          ]);
        } else {
          const generalPartner = new GeneralPartnerBuilder()
            .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
            .isPerson()
            .withNotDisqualifiedStatementChecked(true)
            .withNationality1("British")
            .withNationality2("Irish")
            .build();

          appDevDependencies.generalPartnerGateway.feedGeneralPartners([
            generalPartner,
          ]);
        }

        setLocalesEnabled(true);
        const res = await request(app).get(url);

        expect(res.status).toBe(200);
        expect(res.text).toContain("Joe - GP");
        expect(res.text).toContain("Doe - GP");
        expect(res.text).toContain('<option value="British" selected>British</option>');
        expect(res.text).toContain('<option value="Irish" selected>Irish</option>');
      });
    });

    describe("POST general partner cease date page", () => {
      it.each([
        ["with appointment id", URL],
        ["with general partner id", URL_WITH_IDS],
      ])("should send the general partner person details to API %s", async (_description: string, url: string) => {
        expect(appDevDependencies.generalPartnerGateway.generalPartners).toHaveLength(0);

        if (url.includes("/general-partner/")) {
          const generalPartner = new GeneralPartnerBuilder()
            .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
            .isPerson()
            .withNotDisqualifiedStatementChecked(true)
            .withNationality1("British")
            .withNationality2("Irish")
            .withKind(PartnerKind.UPDATE_GENERAL_PARTNER_PERSON)
            .build();

          appDevDependencies.generalPartnerGateway.feedGeneralPartners([
            generalPartner,
          ]);
        }

        const res = await request(app).post(url).send({
          pageType: PostTransitionPageType.updateGeneralPartnerPerson,
          "forename": "John",
          "surname": "Doe",
          "nationality1": "British",
          "nationality2": "Irish"
        });

        expect(res.status).toBe(302);
        expect(res.text).toContain(`Redirecting to ${REDIRECT}`);

        expect(appDevDependencies.generalPartnerGateway.generalPartners).toHaveLength(1);
        expect(appDevDependencies.generalPartnerGateway.generalPartners[0].data?.kind).toEqual(
          PartnerKind.UPDATE_GENERAL_PARTNER_PERSON
        );
        expect(appDevDependencies.generalPartnerGateway.generalPartners[0].data?.forename).toEqual("John");
        expect(appDevDependencies.generalPartnerGateway.generalPartners[0].data?.surname).toEqual("Doe");
        expect(appDevDependencies.generalPartnerGateway.generalPartners[0].data?.nationality1).toEqual("British");
        expect(appDevDependencies.generalPartnerGateway.generalPartners[0].data?.nationality2).toEqual("Irish");
      });

      it("should replay entered data when a validation error occurs", async () => {
        const apiErrors: ApiErrors = {
          errors: { forename: "forename is invalid" }
        };
        appDevDependencies.generalPartnerGateway.feedErrors(apiErrors);

        const res = await request(app).post(URL).send({
          pageType: PostTransitionPageType.updateGeneralPartnerPerson,
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
});
