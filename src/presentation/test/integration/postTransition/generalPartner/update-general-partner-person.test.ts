import request from "supertest";
import enTranslationText from "../../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../../locales/cy/translations.json";
import app from "../../app";
import {
  UPDATE_GENERAL_PARTNER_PERSON_URL,
  UPDATE_GENERAL_PARTNER_PERSON_WITH_IDS_URL,
} from "../../../../controller/postTransition/url";
import { getUrl, setLocalesEnabled, testTranslations } from "../../../utils";
import CompanyProfileBuilder from "../../../builder/CompanyProfileBuilder";
import CompanyAppointmentBuilder from "../../../builder/CompanyAppointmentBuilder";
import { appDevDependencies } from "../../../../../config/dev-dependencies";
import GeneralPartnerBuilder from "../../../../../presentation/test/builder/GeneralPartnerBuilder";

describe("Update General Partner Legal Entity Page", () => {
  const URL = getUrl(UPDATE_GENERAL_PARTNER_PERSON_URL);
  const URL_WITH_IDS = getUrl(UPDATE_GENERAL_PARTNER_PERSON_WITH_IDS_URL);

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

  describe("Get update general partner person page", () => {
    it("should load the update general partner legal entity page with English text", async () => {
      setLocalesEnabled(true);

      const res = await request(app).get(URL + "?lang=en");

      expect(res.status).toBe(200);

      expect(res.text).toContain(
        `${companyProfile.data.companyName?.toUpperCase()} (${companyProfile.data.companyNumber?.toUpperCase()})`
      );

      testTranslations(res.text, enTranslationText.updatePartnerPersonPage, [
        "limitedPartner",
        "errorMessages",
      ]);

      expect(res.text).not.toContain("WELSH -");
    });

    it("should load the update general partner person page with Welsh text", async () => {
      setLocalesEnabled(true);

      const res = await request(app).get(URL + "?lang=cy");

      expect(res.status).toBe(200);

      expect(res.text).toContain(
        `${companyProfile.data.companyName?.toUpperCase()} (${companyProfile.data.companyNumber?.toUpperCase()})`
      );

      testTranslations(res.text, cyTranslationText.updatePartnerPersonPage, [
        "limitedPartner",
        "errorMessages",
      ]);
    });

    it("should contain the partnership name", async () => {
      const res = await request(app).get(URL);

      expect(res.status).toBe(200);
      expect(res.text).toContain(
        `${companyProfile.data.companyName.toUpperCase()} (${companyProfile.data.companyNumber.toUpperCase()})`
      );
    });

    it("should load the update general partner person page and replay saved data from CHS appointment", async () => {
      companyAppointment = new CompanyAppointmentBuilder()
        .withOfficerRole("general-partner-in-a-limited-partnership")
        .withName("Doe - GP, Joe - GP")
        .withNationality("British,Irish")
        .build();
      appDevDependencies.companyGateway.feedCompanyAppointments([
        companyAppointment,
      ]);

      setLocalesEnabled(true);
      const res = await request(app).get(URL);

      expect(res.status).toBe(200);
      expect(res.text).toContain("Joe - GP");
      expect(res.text).toContain("Doe - GP");
      expect(res.text).toContain(
        '<option value="British" selected>British</option>'
      );
      expect(res.text).toContain(
        '<option value="Irish" selected>Irish</option>'
      );
    });

    it("should load the update general partner person page and replay saved general partner data", async () => {
      const generalPartner = new GeneralPartnerBuilder()
        .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
        .isPerson()
        .withNotDisqualifiedStatementChecked(true)
        .withNationality1("British")
        .build();

      appDevDependencies.generalPartnerGateway.feedGeneralPartners([
        generalPartner,
      ]);

      setLocalesEnabled(true);
      const res = await request(app).get(URL_WITH_IDS);

      expect(res.status).toBe(200);
      expect(res.text).toContain("Joe - GP");
      expect(res.text).toContain("Doe - GP");
      expect(res.text).toContain(
        '<option value="British" selected>British</option>'
      );
    });
  });
});
