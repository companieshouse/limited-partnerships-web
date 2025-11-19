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

  const nationalitySetters = [
    ["nationality1 only", (builder: GeneralPartnerBuilder, nationality: string) => builder.withNationality1(nationality)],
    ["nationality2 only", (builder: GeneralPartnerBuilder, nationality: string) => builder.withNationality2(nationality)],
    ["both nationalities", (builder: GeneralPartnerBuilder, nationality: string) => builder.withNationality1(nationality).withNationality2(nationality)]
  ] as [string, (builder: GeneralPartnerBuilder, nationality: string) => GeneralPartnerBuilder][];

  const nationalityTestCases = [
    ["CONGOLESE (CONGO)", "Congolese (Congo)", ["Congolese (congo)", "CONGOLESE (CONGO)"]],
    ["CONGOLESE (DRC)", "Congolese (DRC)", ["Congolese (Drc)", "CONGOLESE (DRC)"]],
    ["VATICAN CITIZEN", "Vatican citizen", ["Vatican Citizen"]],
    ["CITIZEN OF ANTIGUA AND BARBUDA", "Citizen of Antigua and Barbuda", ["citizen of Antigua and Barbuda"]],
    ["CITIZEN OF THE DOMINICAN REPUBLIC", "Citizen of the Dominican Republic", ["Citizen Of The Dominican Republic"]],
    ["CITIZEN OF GUINEA-BISSAU", "Citizen of Guinea-Bissau", ["Citizen of Guinea-bissau"]],
    ["BRITISH", "British", ["BRITISH", "british"]]
  ] as const;

  describe.each(nationalitySetters)("%s", (description, setNationality) => {
    it.each(nationalityTestCases)(`should format %s as %s (${description})`, async (input, expected, notExpected) => {
      const builder = new GeneralPartnerBuilder().isPerson();
      setNationality(builder, input);
      const partner = builder.build();
      appDevDependencies.generalPartnerGateway.feedGeneralPartners([partner]);

      const res = await request(app).get(URL);

      expect(res.status).toBe(200);
      expect(res.text).toContain(expected);
      notExpected.forEach((value: string) => expect(res.text).not.toContain(value));
    });
  });
});
