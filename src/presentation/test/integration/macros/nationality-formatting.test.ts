import request from "supertest";
import app from "../app";
import { appDevDependencies } from "../../../../config/dev-dependencies";
import GeneralPartnerBuilder from "../../builder/GeneralPartnerBuilder";
import CompanyProfileBuilder from "../../builder/CompanyProfileBuilder";
import { GENERAL_PARTNER_CHECK_YOUR_ANSWERS_URL } from "../../../controller/postTransition/url";
import { getUrl } from "../../utils";

/**
 * Test suite for nationality formatting macro
 * Tests the formatNationality macro to ensure proper capitalization
 * according to GOV.UK nationality standards
 */
describe("Nationality Formatting Macro", () => {
  const URL = getUrl(GENERAL_PARTNER_CHECK_YOUR_ANSWERS_URL);

  beforeEach(() => {
    const companyProfile = new CompanyProfileBuilder().build();
    appDevDependencies.companyGateway.feedCompanyProfile(companyProfile.data);
  });

  describe("Bracketed nationalities", () => {
    it("should format Congolese (Congo) with capitalized word in brackets", async () => {
      const partner = new GeneralPartnerBuilder()
        .isPerson()
        .withNationality1("CONGOLESE (CONGO)")
        .build();
      appDevDependencies.generalPartnerGateway.feedGeneralPartners([partner]);

      const res = await request(app).get(URL);

      expect(res.status).toBe(200);
      expect(res.text).toContain("Congolese (Congo)");
      expect(res.text).not.toContain("Congolese (congo)");
      expect(res.text).not.toContain("CONGOLESE (CONGO)");
    });

    it("should format Congolese (DRC) with uppercase acronym in brackets", async () => {
      const partner = new GeneralPartnerBuilder()
        .isPerson()
        .withNationality1("CONGOLESE (DRC)")
        .build();
      appDevDependencies.generalPartnerGateway.feedGeneralPartners([partner]);

      const res = await request(app).get(URL);

      expect(res.status).toBe(200);
      expect(res.text).toContain("Congolese (DRC)");
      expect(res.text).not.toContain("Congolese (Drc)");
      expect(res.text).not.toContain("CONGOLESE (DRC)");
    });
  });

  describe("Exception word handling", () => {
    it("should format 'Vatican citizen' with lowercase 'citizen'", async () => {
      const partner = new GeneralPartnerBuilder()
        .isPerson()
        .withNationality1("VATICAN CITIZEN")
        .build();
      appDevDependencies.generalPartnerGateway.feedGeneralPartners([partner]);

      const res = await request(app).get(URL);

      expect(res.status).toBe(200);
      expect(res.text).toContain("Vatican citizen");
      expect(res.text).not.toContain("Vatican Citizen");
    });

    it("should capitalize 'Citizen' when first and lowercase 'of' and 'and'", async () => {
      const partner = new GeneralPartnerBuilder()
        .isPerson()
        .withNationality1("CITIZEN OF ANTIGUA AND BARBUDA")
        .build();
      appDevDependencies.generalPartnerGateway.feedGeneralPartners([partner]);

      const res = await request(app).get(URL);

      expect(res.status).toBe(200);
      expect(res.text).toContain("Citizen of Antigua and Barbuda");
      expect(res.text).not.toContain("citizen of Antigua and Barbuda");
    });

    it("should lowercase 'the' in middle positions", async () => {
      const partner = new GeneralPartnerBuilder()
        .isPerson()
        .withNationality1("CITIZEN OF THE DOMINICAN REPUBLIC")
        .build();
      appDevDependencies.generalPartnerGateway.feedGeneralPartners([partner]);

      const res = await request(app).get(URL);

      expect(res.status).toBe(200);
      expect(res.text).toContain("Citizen of the Dominican Republic");
      expect(res.text).not.toContain("Citizen Of The Dominican Republic");
    });
  });

  describe("Hyphenated words", () => {
    it("should capitalize both parts of hyphenated words", async () => {
      const partner = new GeneralPartnerBuilder()
        .isPerson()
        .withNationality1("CITIZEN OF GUINEA-BISSAU")
        .build();
      appDevDependencies.generalPartnerGateway.feedGeneralPartners([partner]);

      const res = await request(app).get(URL);

      expect(res.status).toBe(200);
      expect(res.text).toContain("Citizen of Guinea-Bissau");
      expect(res.text).not.toContain("Citizen of Guinea-bissau");
    });
  });

  describe("Simple nationalities", () => {
    it("should format simple nationality correctly", async () => {
      const partner = new GeneralPartnerBuilder()
        .isPerson()
        .withNationality1("BRITISH")
        .build();
      appDevDependencies.generalPartnerGateway.feedGeneralPartners([partner]);

      const res = await request(app).get(URL);

      expect(res.status).toBe(200);
      expect(res.text).toContain("British");
      expect(res.text).not.toContain("BRITISH");
      expect(res.text).not.toContain("british");
    });
  });
});
