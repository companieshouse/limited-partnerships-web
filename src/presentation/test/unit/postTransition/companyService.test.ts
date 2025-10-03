import { appDevDependencies } from "../../../../config/dev-dependencies";
import CompanyProfileBuilder from "../../builder/CompanyProfileBuilder";

describe("CompanyService", () => {
  let companyProfile;

  beforeEach(() => {
    companyProfile = new CompanyProfileBuilder().build();
    appDevDependencies.companyGateway.feedCompanyProfile(companyProfile.data);
    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([]);
  });

  describe("Company address", () => {
    it("should map the company address to the limited partnership address", async () => {
      const result = await appDevDependencies.companyService.buildLimitedPartnershipFromCompanyProfile(
        { access_token: "token", refresh_token: "token" },
        companyProfile.data.companyNumber
      );

      expect(result.limitedPartnership.data?.registered_office_address).toEqual({
        address_line_1: companyProfile.data.registeredOfficeAddress?.addressLineOne,
        address_line_2: companyProfile.data.registeredOfficeAddress?.addressLineTwo,
        premises: companyProfile.data.registeredOfficeAddress?.premises,
        locality: companyProfile.data.registeredOfficeAddress?.locality,
        region: companyProfile.data.registeredOfficeAddress?.region,
        country: companyProfile.data.registeredOfficeAddress?.country,
        postal_code: companyProfile.data.registeredOfficeAddress?.postalCode
      });

      expect(result.limitedPartnership.data?.principal_place_of_business_address).toEqual({
        address_line_1: companyProfile.data.serviceAddress?.addressLineOne,
        address_line_2: companyProfile.data.serviceAddress?.addressLineTwo,
        premises: companyProfile.data.serviceAddress?.premises,
        locality: companyProfile.data.serviceAddress?.locality,
        region: companyProfile.data.serviceAddress?.region,
        country: companyProfile.data.serviceAddress?.country,
        postal_code: companyProfile.data.serviceAddress?.postalCode
      });
    });
  });
});
