import request from "supertest";

import enTranslationText from "../../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../../locales/cy/translations.json";

import app from "../../app";
import { appDevDependencies } from "../../../../../config/dev-dependencies";
import { getUrl, setLocalesEnabled } from "../../../utils";

import CompanyProfileBuilder from "../../../builder/CompanyProfileBuilder";
import { WHEN_DID_THE_GENERAL_PARTNER_PERSON_CEASE_URL } from "../../../../controller/postTransition/url";
import CompanyOfficerBuilder from "../../../builder/CompanyOfficerBuilder";

describe("General Partner cease date page", () => {
  const URL = getUrl(WHEN_DID_THE_GENERAL_PARTNER_PERSON_CEASE_URL);

  let companyProfile;

  beforeEach(() => {
    setLocalesEnabled(true);

    appDevDependencies.companyGateway.setError(false);
    appDevDependencies.cacheRepository.feedCache(null);

    companyProfile = new CompanyProfileBuilder().build();
    appDevDependencies.companyGateway.feedCompanyProfile(companyProfile.data);

    const generalPartner = new CompanyOfficerBuilder()
      .withOfficerRole("general-partner-in-a-limited-partnership")
      .build();
    appDevDependencies.companyGateway.feedCompanyOfficers([generalPartner]);
  });

  describe("GET general partner cease date page", () => {
    it("should load general partner cease date page with english text", async () => {
      const res = await request(app).get(URL + "?lang=en");

      expect(res.status).toBe(200);
      expect(res.text).toContain(`${enTranslationText.ceaseDate.removeGeneralPartner.title}`);
      expect(res.text).not.toContain("WELSH -");

      expect(res.text).toContain(companyProfile.data.companyName.toUpperCase());
    });

    it("should load general partner cease date page with welsh text", async () => {
      const res = await request(app).get(URL + "?lang=cy");

      expect(res.status).toBe(200);
      expect(res.text).toContain(`${cyTranslationText.ceaseDate.removeGeneralPartner.title}`);
      expect(res.text).toContain("WELSH -");
    });
  });
});
